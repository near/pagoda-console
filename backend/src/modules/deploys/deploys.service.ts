import { ProjectsService } from '@/src/core/projects/projects.service';
import sodium from 'libsodium-wrappers';
import { BadRequestException, Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { PrismaService } from './prisma.service';
import { Environment, Project, User } from '@pc/database/clients/core';
import { Repository } from '@pc/database/clients/deploys';
import { createHash, randomBytes, scryptSync } from 'crypto';
import { encode } from 'bs58';
import { VError } from 'verror';
import { connect, KeyPair, keyStores } from 'near-api-js';
import { PermissionsService as ProjectPermissionsService } from '../../core/projects/permissions.service';
import { ReadonlyService } from './readonly.service';
import { Octokit } from '@octokit/core';
import { GithubService } from '@/src/core/github/github.service';

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  13,
);

@Injectable()
export class DeploysService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private projectPermissions: ProjectPermissionsService,
    private readonlyService: ReadonlyService,
    private githubService: GithubService,
  ) {}

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
      octokit = await this.githubService.getUserOctokit(user);
    } catch (e: any) {
      throw new VError(
        e,
        'Could not establish octokit conneciton for template creation',
      );
    }

    const {
      data: { full_name: repoFullName },
    } = (await octokit
      .request(`POST /repos/${githubRepoFullName}/generate`, {
        name: projectName,
      })
      .catch((e) => {
        if (/Name already exists on this account/.test(e.message)) {
          throw new BadRequestException(
            'Repository name already exists on this GitHub account',
          );
        }
        throw new VError(e, 'Could not create repo from template');
      })) as any;

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

    return this.addDeployRepository({
      projectSlug: project.slug,
      environmentSubId: testnetEnv.subId,
      githubRepoFullName: repoFullName,
      authTokenHash,
      authTokenSalt,
    });
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

  /**
   * Entry point for deploying one or more WASMs from
   * a github repo
   */
  async deployRepository({
    githubRepoFullName,
    commitHash,
    commitMessage,
    files,
  }: {
    githubRepoFullName: string;
    commitHash: string;
    commitMessage: string;
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
    const repo = await this.prisma.repository.findUnique({
      where: {
        githubRepoFullName,
      },
      include: {
        contractDeployConfigs: true,
      },
    });

    if (!repo) {
      throw new BadRequestException(
        'githubRepoFullName not found please add a Repository project to deploy to',
      );
    }

    const repoDeployment = await this.prisma.repoDeployment.create({
      data: {
        slug: nanoid(),
        repositorySlug: repo.slug,
        commitHash,
        commitMessage,
      },
    });

    await Promise.all(
      files.map(async (file) => {
        let deployConfig = repo.contractDeployConfigs.find(
          ({ filename }) => filename === file.originalname,
        );
        if (!deployConfig) {
          deployConfig = await this.generateDeployConfig({
            filename: file.originalname,
            repositorySlug: repo.slug,
          });
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

  async generateDeployConfig({
    filename,
    repositorySlug,
  }: {
    filename: string;
    repositorySlug: Repository['slug'];
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

    return this.prisma.contractDeployConfig.create({
      data: {
        slug: nanoid(),
        nearPrivateKey: keyPair.toString(),
        filename,
        repositorySlug,
        nearAccountId: accountId,
      },
    });
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
        throw new VError(
          e,
          `Could not deploy wasm to account ${account.accountId}`,
        );
      }
    }

    await this.prisma.contractDeployment.create({
      data: {
        slug: nanoid(),
        repoDeploymentSlug,
        contractDeployConfigSlug: deployConfig.slug,
        deployTransactionHash: txOutcome ? txOutcome.transaction.hash : null,
      },
    });

    await this.projectsService.systemAddContract(
      projectSlug,
      subId,
      account.accountId,
    );
  }

  /**
   * Sets Frontend Deploy Url
   */
  async addFrontend({
    repositorySlug,
    frontendDeployUrl,
    cid,
    packageName,
    repoDeploymentSlug,
  }) {
    let frontendDeployConfig = await this.prisma.frontendDeployConfig.findFirst(
      {
        where: {
          repositorySlug,
          packageName,
        },
      },
    );

    if (!frontendDeployConfig) {
      frontendDeployConfig = await this.prisma.frontendDeployConfig.create({
        data: {
          slug: nanoid(),
          repositorySlug,
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
      throw new BadRequestException(
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

  getRepoDeploymentBySlug(slug) {
    return this.prisma.repoDeployment.findUnique({
      where: {
        slug,
      },
      include: {
        repository: true,
      },
    });
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
        repoDeployments: {
          // Get the latest deployment
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
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
              },
            },
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
        repoDeployments,
      } = repository;

      return {
        slug,
        projectSlug,
        environmentSubId,
        githubRepoFullName,
        enabled,
        frontendDeployConfigs,
        contractDeployConfigs,
        repoDeployments: repoDeployments.map((r) => {
          const {
            slug,
            commitHash,
            commitMessage,
            createdAt,
            frontendDeployments,
            contractDeployments,
          } = r;

          return {
            slug,
            commitHash,
            commitMessage,
            githubRepoFullName,
            createdAt: createdAt.toISOString(),
            frontendDeployments,
            contractDeployments,
          };
        }),
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
        repository,
      } = deployment;

      return {
        slug,
        commitHash,
        commitMessage,
        createdAt: createdAt.toISOString(),
        frontendDeployments,
        contractDeployments,
        githubRepoFullName: repository.githubRepoFullName,
      };
    });
  }
}
