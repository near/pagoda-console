import { ProjectsService } from '@/src/core/projects/projects.service';
import sodium from 'libsodium-wrappers';
import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { PrismaService } from './prisma.service';
import { Environment, Project, User } from '@pc/database/clients/core';
import {
  ContractDeployConfig,
  NearSocialComponentDeployConfig,
  Repository,
} from '@pc/database/clients/deploys';
import { createHash, randomBytes, scryptSync } from 'crypto';
import { encode } from 'bs58';
import { VError } from 'verror';
import { connect, KeyPair, keyStores } from 'near-api-js';
import { PermissionsService as ProjectPermissionsService } from '../../core/projects/permissions.service';
import { ReadonlyService } from './readonly.service';
import { Octokit } from '@octokit/core';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/src/config/validate';
import { DeployError } from './deploy-error';
import _ from 'lodash';
import { parseNearAmount } from 'near-api-js/lib/utils/format';

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  13,
);

@Injectable()
export class DeploysService {
  private githubToken: string;
  private repositoryOwner: string;
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private projectPermissions: ProjectPermissionsService,
    private readonlyService: ReadonlyService,
    private config: ConfigService<AppConfig>,
  ) {
    const { githubToken, repositoryOwner } = this.config.get('gallery', {
      infer: true,
    })!;
    this.githubToken = githubToken;
    this.repositoryOwner = repositoryOwner;
  }

  /**
   * Creates a Console project then links a github repo
   * to its testnet environment
   */
  async createDeployProject({
    user,
    githubRepoFullName,
    projectName,
  }: {
    user: User;
    githubRepoFullName: string;
    projectName: Project['name'];
  }) {
    let octokit: Octokit;
    try {
      octokit = new Octokit({
        auth: this.githubToken,
      });
    } catch (e: any) {
      throw new VError(
        e,
        'Could not establish octokit conneciton for template creation',
      );
    }

    // Make sure the project name is unique before generating the GitHub repo.
    const isUnique = await this.projectsService.isProjectNameUniqueForUser(
      user,
      projectName,
    );
    if (!isUnique) {
      throw new VError(
        {
          info: {
            code: 'NAME_CONFLICT',
          },
        },
        'Project name is not unique',
      );
    }

    const {
      data: { full_name: repoFullName },
    } = (await octokit
      .request(`POST /repos/${githubRepoFullName}/generate`, {
        name: projectName,
        owner: this.repositoryOwner,
      })
      .catch((e) => {
        if (/Name already exists on this account/.test(e.message)) {
          throw new VError(
            { info: { code: DeployError.NAME_CONFLICT } },
            'Repository name already exists on this GitHub account',
          );
        }
        throw new VError(e, 'Could not create repo from template');
      })) as any;

    // OWASP recommended password hashing:
    // If Argon2id is not available, use scrypt with a minimum CPU/memory cost parameter of (2^16),
    // a minimum block size of 8 (1024 bytes), and a parallelization parameter of 1.
    const actionAuthToken = nanoid(25);
    const authTokenSalt = randomBytes(32);
    const authTokenHash = this.hashToken(actionAuthToken, authTokenSalt);

    const {
      data: { key, key_id },
    } = (await octokit
      .request(`GET /repos/${repoFullName}/actions/secrets/public-key`)
      .catch((e) => {
        throw new VError(
          e,
          'Could not get repo public key to set secrets on repo',
        );
      })) as any;

    const secret_name = 'PAGODA_CONSOLE_TOKEN';

    const encryptedSecret = await sodium.ready.then(() => {
      // Convert Secret & Base64 key to Uint8Array.
      const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
      const binsec = sodium.from_string(
        'Basic ' +
          sodium.to_base64(
            `${repoFullName}:${actionAuthToken}`,
            sodium.base64_variants.ORIGINAL,
          ),
      );

      //Encrypt the secret using LibSodium
      const encBytes = sodium.crypto_box_seal(binsec, binkey);

      // Convert encrypted Uint8Array to Base64
      const output = sodium.to_base64(
        encBytes,
        sodium.base64_variants.ORIGINAL,
      );

      return output;
    });

    await octokit
      .request(`PUT /repos/${repoFullName}/actions/secrets/${secret_name}`, {
        encrypted_value: encryptedSecret,
        key_id,
      })
      .catch((e) => {
        throw new VError(e, 'Could not set secrets on repo');
      });

    let project, environments;

    // create the project which this deployment will be placed under
    try {
      project = await this.projectsService.create(user, projectName);
    } catch (e: any) {
      throw new VError(e, 'Failed to create project for deployment');
    }

    // grab environments from the newly created project because we attach
    // deploys to specific environments
    try {
      environments = await this.projectsService.getEnvironments(user, {
        slug: project.slug,
      });
    } catch (e: any) {
      throw new VError(
        e,
        'Failed to fetch environments for newly created deploy project',
      );
    }

    // for templates, we only support deploying to testnet at the moment, so
    // this is hardcoded
    const testnetEnv = environments.find((env) => env.net === 'TESTNET');
    if (!testnetEnv) {
      throw new VError('Could not find testnet env for newly created project');
    }

    return this.addDeployRepository({
      projectSlug: project.slug,
      environmentSubId: testnetEnv.subId,
      githubRepoFullName: repoFullName,
      authTokenHash,
      authTokenSalt,
    });
  }

  async transferGithubRepository({
    user,
    newGithubUsername,
    repositorySlug,
  }: {
    user: User;
    newGithubUsername: string;
    repositorySlug: string;
  }) {
    const { isTransferred } = await this.isRepositoryTransferred(
      user,
      repositorySlug,
    );

    if (isTransferred) {
      throw new VError(
        { info: { code: 'BAD_REQUEST' } },
        'Repository was already transferred',
      );
    }

    const repo = await this.prisma.repository.findUnique({
      where: {
        slug: repositorySlug,
      },
    });

    if (!repo) {
      throw new VError(
        { info: { code: 'BAD_REQUEST' } },
        'repo does not exist',
      );
    }

    const { createdBy } = await this.projectsService.getActiveProject({
      slug: repo.projectSlug,
    });

    if (createdBy !== user.id) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'User cannot modify this repo',
      );
    }

    let octokit: Octokit;
    try {
      octokit = new Octokit({
        auth: this.githubToken,
      });
    } catch (e: any) {
      throw new VError(
        e,
        'Could not establish octokit conneciton for template creation',
      );
    }

    try {
      await octokit.request(`POST /repos/${repo.githubRepoFullName}/transfer`, {
        new_owner: newGithubUsername,
        // * Github doesn't seem to allow changing the name of the repo when transferring.
        // new_name: repo.githubRepoFullName.split('/')[1],
      });
    } catch (e: any) {
      if (e.status === 404) {
        // TODO replace with returning a code to the UI and tell the user they already initiaed a transfer.
        throw new VError(e, 'Could not find the repository to transfer');
      } else if (e.status === 400) {
        throw new VError(
          { info: { code: DeployError.TRANSFER_INITIATED } },
          'Repository transfer already initiated',
        );
      }
      throw new VError(e, 'Could not transfer the repository');
    }

    const actionAuthToken = nanoid(25);
    const authTokenSalt = randomBytes(32);
    const authTokenHash = this.hashToken(actionAuthToken, authTokenSalt);

    const {
      data: { key, key_id },
    } = (await octokit
      .request(
        `GET /repos/${repo.githubRepoFullName}/actions/secrets/public-key`,
      )
      .catch((e) => {
        throw new VError(
          e,
          'Could not get repo public key to set secrets on repo',
        );
      })) as any;

    const secret_name = 'PAGODA_CONSOLE_TOKEN';

    const encryptedSecret = await sodium.ready.then(() => {
      // Convert Secret & Base64 key to Uint8Array.
      const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
      const binsec = sodium.from_string(
        'Basic ' +
          sodium.to_base64(
            `${newGithubUsername}/${
              repo.githubRepoFullName.split('/')[1]
            }:${actionAuthToken}`,
            sodium.base64_variants.ORIGINAL,
          ),
      );

      //Encrypt the secret using LibSodium
      const encBytes = sodium.crypto_box_seal(binsec, binkey);

      // Convert encrypted Uint8Array to Base64
      const output = sodium.to_base64(
        encBytes,
        sodium.base64_variants.ORIGINAL,
      );

      return output;
    });

    await octokit
      .request(
        `PUT /repos/${repo.githubRepoFullName}/actions/secrets/${secret_name}`,
        {
          encrypted_value: encryptedSecret,
          key_id,
        },
      )
      .catch((e) => {
        throw new VError(e, 'Could not set secrets on repo');
      });

    return this.prisma.repository.update({
      where: {
        slug: repositorySlug,
      },
      data: {
        githubRepoFullName: `${newGithubUsername}/${
          repo.githubRepoFullName.split('/')[1]
        }`,
        authTokenHash,
        authTokenSalt,
      },
    });
  }

  async isRepositoryTransferred(
    user: User,
    repositorySlug: Repository['slug'],
  ) {
    const repo = await this.prisma.repository.findUnique({
      where: {
        slug: repositorySlug,
      },
    });

    if (!repo) {
      throw new VError(
        { info: { code: DeployError.BAD_REPO } },
        'Repository not found',
      );
    }

    await this.projectPermissions.checkUserProjectPermission(
      user.id,
      repo.projectSlug,
    );

    let octokit: Octokit;
    try {
      octokit = new Octokit({
        auth: this.githubToken,
      });
    } catch (e: any) {
      throw new VError(e, 'Could not establish octokit connection');
    }

    const originalOwner = this.repositoryOwner;
    const originalRepositoryName = repo.githubRepoFullName.split('/')[1];

    const oldFullName = `${originalOwner}/${originalRepositoryName}`;

    let isTransferred;
    // Get repository details from Github.
    try {
      const { data } = await octokit.request(
        `GET /repos/${originalOwner}/${originalRepositoryName}`,
      );
      isTransferred = data.full_name !== oldFullName;
    } catch (e: any) {
      if (e.message !== 'Not Found') {
        throw new VError(e, 'Could not get repo details from github');
      }
      isTransferred = true;
    }

    if (isTransferred) {
      this.removeGithubCollaborator(repo.githubRepoFullName);
    }

    return {
      isTransferred,
    };
  }

  async removeGithubCollaborator(repoFullName) {
    let octokit: Octokit;
    try {
      octokit = new Octokit({
        auth: this.githubToken,
      });
    } catch (e: any) {
      throw new VError(
        e,
        'Could not establish octokit conneciton for template creation',
      );
    }

    await octokit.request(
      `DELETE /repos/${repoFullName}/collaborators/${this.repositoryOwner}`,
    );
  }

  /**
   * Sets up a github repo for automated deploys and
   * attaches it to a given project environment
   */
  async addDeployRepository({
    projectSlug,
    environmentSubId,
    githubRepoFullName,
    authTokenHash,
    authTokenSalt,
  }: {
    projectSlug: Project['slug'];
    environmentSubId: Environment['subId'];
    githubRepoFullName: string;
    authTokenHash: Buffer;
    authTokenSalt: Buffer;
  }) {
    return this.prisma.repository.create({
      data: {
        slug: nanoid(),
        projectSlug,
        environmentSubId,
        githubRepoFullName,
        authTokenHash,
        authTokenSalt,
      },
    });
  }

  async addRepoDeployment({
    githubRepoFullName,
    commitHash,
    commitMessage,
  }: {
    githubRepoFullName: string;
    commitHash: string;
    commitMessage: string;
  }) {
    const repo = await this.prisma.repository.findUnique({
      where: {
        githubRepoFullName,
      },
      include: {
        contractDeployConfigs: true,
      },
    });

    if (!repo) {
      throw new VError(
        { info: { code: 'BAD_REQUEST' } },
        'githubRepoFullName not found please add a Repository project to deploy to',
      );
    }

    return this.prisma.repoDeployment.create({
      data: {
        slug: nanoid(),
        repositorySlug: repo.slug,
        commitHash,
        commitMessage,
      },
    });
  }

  /**
   * Entry point for deploying one or more WASMs from
   * a github repo
   */
  async addContractDeployment({
    repoDeploymentSlug,
    files,
  }: {
    repoDeploymentSlug: string;
    files: Array<Express.Multer.File>;
  }) {
    /*
    - find matching Repository
    - create new RepoDeployment
    - match each bundle to a ContractDeployConfig
      - if a match cannot be found, create a new ContractDeployConfig w/ generateDeployConfig.
        This allows us to be dynamic and handle new contracts as they are added to the repo
        instead of making the contract set static at time of connecting the repo
    - deployContract for contract
    */

    const repoDeployment = await this.getRepoDeploymentBySlug(
      repoDeploymentSlug,
    );

    if (!repoDeployment) {
      throw new VError(
        { info: { code: 'BAD_REQUEST' } },
        `Could not find repoDeployment with that slug`,
      );
    }

    const repo = repoDeployment.repository;

    await Promise.all(
      files.map(async (file) => {
        let deployConfig = repo.contractDeployConfigs.find(
          ({ filename }) => filename === file.originalname,
        );
        if (!deployConfig) {
          deployConfig = (await this.generateDeployConfig({
            filename: file.originalname,
            repositorySlug: repo.slug,
            type: 'contract',
          })) as ContractDeployConfig;
        }
        return this.deployContract({
          deployConfig,
          file: file.buffer,
          repoDeploymentSlug: repoDeployment.slug,
          projectSlug: repo.projectSlug,
          subId: repo.environmentSubId,
        });
      }),
    );

    return this.prisma.repoDeployment.findUnique({
      where: {
        slug: repoDeployment.slug,
      },
      include: {
        contractDeployments: {
          include: {
            contractDeployConfig: {
              select: {
                nearAccountId: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Entry point for deploying one or more Near Social Components from
   * a github repo
   */
  async addNearSocialComponentDeployment({
    repoDeploymentSlug,
    metadata = {},
    file,
  }: {
    repoDeploymentSlug: string;
    metadata?: {
      componentName?: string;
      componentDescription?: string;
      componentIconIpfsCid?: string;
      componentTags?: string[];
    };
    file: Express.Multer.File;
  }) {
    const repoDeployment = await this.getRepoDeploymentBySlug(
      repoDeploymentSlug,
    );

    if (!repoDeployment) {
      throw new VError(
        { info: { code: 'BAD_REQUEST' } },
        'Could not find repoDeployment with that slug',
      );
    }

    const repo = repoDeployment.repository;

    const componentName = metadata.componentName || file.originalname;

    let deployConfig = repo.nearSocialComponentDeployConfigs.find(
      (deployConfig) => deployConfig.componentName === componentName,
    );

    if (!deployConfig) {
      deployConfig = (await this.generateDeployConfig({
        filename: componentName,
        repositorySlug: repo.slug,
        type: 'component',
      })) as NearSocialComponentDeployConfig;
    }

    await this.deployNearSocialComponent({
      deployConfig,
      file: file.buffer,
      repoDeploymentSlug: repoDeployment.slug,
      metadata,
    });

    return this.prisma.repoDeployment.findUnique({
      where: {
        slug: repoDeployment.slug,
      },
      include: {
        nearSocialComponentDeployments: {
          include: {
            nearSocialComponentDeployConfig: {
              select: {
                componentPath: true,
              },
            },
          },
        },
      },
    });
  }

  metadataInputToNearSocialMetaData(metadata) {
    return {
      name: metadata.componentName,
      description: metadata.componentDescription,
      image: {
        ipfs_cid: metadata.componentIconIpfsCid,
      },
      tags: (metadata.componentTags || []).reduce(
        (acc, curr) => ({ ...acc, [curr]: '' }),
        {},
      ),
    };
  }

  async deployNearSocialComponent({
    deployConfig,
    file,
    repoDeploymentSlug,
    metadata,
  }) {
    const keyPair = KeyPair.fromString(deployConfig.nearPrivateKey);
    const keyStore = new keyStores.InMemoryKeyStore();
    const nearConfig = {
      networkId: 'testnet',
      keyStore,
      nodeUrl: 'https://rpc.testnet.near.org', // todo from env?
      helperUrl: 'https://helper.testnet.near.org',
      headers: {},
    };
    await keyStore.setKey(
      nearConfig.networkId,
      deployConfig.nearAccountId,
      keyPair,
    );

    const near = await connect(nearConfig);
    const account = await near.account(deployConfig.nearAccountId);

    const component = await account.viewFunction('v1.social08.testnet', 'get', {
      keys: [`${deployConfig.componentPath}/**`],
    });

    const newComponent = {
      '': file.toString('utf-8'),
      metadata: _.merge(
        _.cloneDeep(component.metadata),
        this.metadataInputToNearSocialMetaData(metadata),
      ),
    };

    let txOutcome;

    const updatedComponentData = _.merge(_.cloneDeep(component), newComponent);

    if (!_.isEqual(newComponent, component)) {
      try {
        txOutcome = await account.functionCall({
          contractId: 'v1.social08.testnet',
          methodName: 'set',
          args: {
            data: {
              [account.accountId]: {
                widget: {
                  [deployConfig.componentName]: updatedComponentData,
                },
              },
            },
          },
          attachedDeposit: parseNearAmount('1'),
        });
      } catch (e: any) {
        await this.prisma.nearSocialComponentDeployment.create({
          data: {
            slug: nanoid(),
            repoDeploymentSlug,
            nearSocialComponentDeployConfigSlug: deployConfig.slug,
            status: 'ERROR',
          },
        });
        throw new VError(
          e,
          `Could not set data on socialDB ${updatedComponentData}`,
        );
      }
    }

    if (txOutcome?.transaction?.hash) {
      await this.prisma.nearSocialComponentDeployment.create({
        data: {
          slug: nanoid(),
          repoDeploymentSlug,
          nearSocialComponentDeployConfigSlug: deployConfig.slug,
          deployTransactionHash: txOutcome.transaction.hash,
          status: 'SUCCESS',
        },
      });
    }
  }

  async generateDeployConfig({
    filename,
    repositorySlug,
    type,
  }: {
    filename: string;
    repositorySlug: Repository['slug'];
    type: 'contract' | 'component';
  }) {
    const keyStore = new keyStores.InMemoryKeyStore();
    const nearConfig = {
      networkId: 'testnet',
      keyStore,
      nodeUrl: 'https://rpc.testnet.near.org', // todo from env?
      helperUrl: 'https://helper.testnet.near.org',
      headers: {},
    };
    const near = await connect(nearConfig);
    const randomNumber = Math.floor(
      Math.random() * (99999999999999 - 10000000000000) + 10000000000000,
    );
    const accountId = `dev-${Date.now()}-${randomNumber}`;
    const keyPair = KeyPair.fromRandom('ed25519');
    await near.accountCreator.createAccount(accountId, keyPair.getPublicKey());
    await keyStore.setKey(nearConfig.networkId, accountId, keyPair);

    if (type === 'contract') {
      return this.prisma.contractDeployConfig.create({
        data: {
          slug: nanoid(),
          nearPrivateKey: keyPair.toString(),
          filename,
          repositorySlug,
          nearAccountId: accountId,
        },
      });
    } else {
      return this.prisma.nearSocialComponentDeployConfig.create({
        data: {
          slug: nanoid(),
          nearPrivateKey: keyPair.toString(),
          componentPath: `${accountId}/widget/${filename}`,
          componentName: filename,
          repositorySlug,
          nearAccountId: accountId,
        },
      });
    }
  }

  /**
   * Deploys a single contract WASM bundle
   */
  async deployContract({
    deployConfig,
    file,
    repoDeploymentSlug,
    projectSlug,
    subId,
  }) {
    const keyPair = KeyPair.fromString(deployConfig.nearPrivateKey);
    const keyStore = new keyStores.InMemoryKeyStore();
    const nearConfig = {
      networkId: 'testnet',
      keyStore,
      nodeUrl: 'https://rpc.testnet.near.org', // todo from env?
      helperUrl: 'https://helper.testnet.near.org',
      headers: {},
    };
    await keyStore.setKey(
      nearConfig.networkId,
      deployConfig.nearAccountId,
      keyPair,
    );

    const near = await connect(nearConfig);
    const account = await near.account(deployConfig.nearAccountId);

    const { code_hash: accountCodeHash } = await account.state();
    const uploadedCodeHash = encode(createHash('sha256').update(file).digest());

    let txOutcome;

    if (uploadedCodeHash != accountCodeHash) {
      try {
        txOutcome = await account.deployContract(file);
      } catch (e: any) {
        await this.prisma.contractDeployment.create({
          data: {
            slug: nanoid(),
            repoDeploymentSlug,
            contractDeployConfigSlug: deployConfig.slug,
            status: 'ERROR',
          },
        });
        throw new VError(
          e,
          `Could not deploy wasm to account ${account.accountId}`,
        );
      }
    }

    if (txOutcome?.transaction?.hash) {
      await this.prisma.contractDeployment.create({
        data: {
          slug: nanoid(),
          repoDeploymentSlug,
          contractDeployConfigSlug: deployConfig.slug,
          deployTransactionHash: txOutcome.transaction.hash,
          status: 'SUCCESS',
        },
      });
    }

    try {
      await this.projectsService.systemAddContract(
        projectSlug,
        subId,
        account.accountId,
      );
    } catch (e: any) {
      if (VError.info(e)?.response === 'DUPLICATE_CONTRACT_ADDRESS') {
        return;
      }
      throw e;
    }
  }

  /**
   * Sets Frontend Deploy Url
   */
  async addFrontendDeployment({
    frontendDeployUrl,
    cid,
    packageName,
    repoDeploymentSlug,
  }) {
    const repoDeployment = await this.getRepoDeploymentBySlug(
      repoDeploymentSlug,
    );

    if (!repoDeployment) {
      throw new VError(
        {
          info: {
            code: 'CONFLICT',
          },
        },
        `RepoDeployment slug ${repoDeploymentSlug} not found`,
      );
    }

    let frontendDeployConfig =
      repoDeployment.repository.frontendDeployConfigs.find((config) => {
        return (
          config.packageName === packageName &&
          config.repositorySlug === repoDeployment.repositorySlug
        );
      });

    if (!frontendDeployConfig) {
      frontendDeployConfig = await this.prisma.frontendDeployConfig.create({
        data: {
          slug: nanoid(),
          repositorySlug: repoDeployment.repositorySlug,
          packageName,
        },
      });
    }

    const existingFrontend = await this.prisma.frontendDeployment.findFirst({
      where: {
        repoDeploymentSlug,
        frontendDeployConfigSlug: frontendDeployConfig.slug,
      },
    });

    if (existingFrontend) {
      throw new VError(
        { info: { code: 'BAD_REQUEST' } },
        `Package ${packageName} already added for repo deployment ${repoDeploymentSlug}`,
      );
    }

    return this.prisma.frontendDeployment.create({
      data: {
        slug: nanoid(),
        url: frontendDeployUrl,
        cid,
        frontendDeployConfigSlug: frontendDeployConfig.slug,
        repoDeploymentSlug,
      },
    });
  }

  async getContractDeployConfigs(slug) {
    const repoDeployment = (await this.getRepoDeploymentBySlug(slug)) as any;
    return repoDeployment.repository.contractDeployConfigs.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.filename]: { nearAccountId: curr.nearAccountId },
      }),
      {},
    );
  }

  async getRepoDeploymentBySlug(slug) {
    const repoDeployment = this.prisma.repoDeployment.findUnique({
      where: {
        slug,
      },
      include: {
        repository: {
          include: {
            contractDeployConfigs: true,
            frontendDeployConfigs: true,
            nearSocialComponentDeployConfigs: true,
          },
        },
      },
    });
    if (!repoDeployment) {
      throw new VError(
        { info: { code: 'NOT_FOUND' } },
        `No such repoDeployment found`,
      );
    }
    return repoDeployment;
  }

  getDeployRepository(githubRepoFullName: string) {
    return this.prisma.repository.findUnique({
      where: {
        githubRepoFullName,
      },
    });
  }

  hashToken(token: string, salt: Buffer) {
    return scryptSync(token, salt, 64, {
      p: 4,
    });
  }

  async listRepositories(user: User, project: Repository['projectSlug']) {
    await this.projectPermissions.checkUserProjectPermission(user.id, project);

    // TODO should we filter enabled repositories?
    const repositories = await this.prisma.repository.findMany({
      where: {
        projectSlug: project,
      },
      include: {
        frontendDeployConfigs: {
          select: { slug: true, packageName: true },
        },
        contractDeployConfigs: {
          select: {
            slug: true,
            filename: true,
            nearAccountId: true,
          },
        },
      },
    });

    return repositories.map((repository) => {
      const {
        slug,
        projectSlug,
        environmentSubId,
        githubRepoFullName,
        enabled,
        frontendDeployConfigs,
        contractDeployConfigs,
      } = repository;

      return {
        slug,
        projectSlug,
        environmentSubId,
        githubRepoFullName,
        enabled,
        frontendDeployConfigs,
        contractDeployConfigs,
      };
    });
  }

  async listDeployments(
    user: User,
    project: Repository['projectSlug'],
    take = 10,
  ) {
    await this.projectPermissions.checkUserProjectPermission(user.id, project);

    const repositories = await this.readonlyService.getRepositories(project);

    if (!repositories.length) {
      return [];
    }

    // TODO right now this assumes we have 1 repo for a given project, which seems to be true for the MVP
    const repository = repositories[0];

    const deployments = await this.prisma.repoDeployment.findMany({
      where: {
        repository,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      include: {
        repository: {
          select: {
            githubRepoFullName: true,
          },
        },
        frontendDeployments: {
          select: {
            slug: true,
            url: true,
            cid: true,
            frontendDeployConfig: {
              select: {
                packageName: true,
              },
            },
          },
        },
        contractDeployments: {
          select: {
            slug: true,
            deployTransactionHash: true,
            status: true,
          },
        },
        nearSocialComponentDeployments: {
          select: {
            slug: true,
            deployTransactionHash: true,
            nearSocialComponentDeployConfig: {
              select: {
                componentName: true,
                componentPath: true,
              },
            },
          },
        },
      },
    });

    return deployments.map((deployment) => {
      const {
        slug,
        commitHash,
        commitMessage,
        createdAt,
        frontendDeployments,
        contractDeployments,
        nearSocialComponentDeployments,
        repository,
      } = deployment;

      return {
        slug,
        commitHash,
        commitMessage,
        createdAt: createdAt.toISOString(),
        frontendDeployments,
        contractDeployments,
        nearSocialComponentDeployments,
        githubRepoFullName: repository.githubRepoFullName,
      };
    });
  }
}
