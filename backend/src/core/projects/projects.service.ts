import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  Prisma,
  Project,
  Net,
  User,
  Contract,
  Environment,
  Org,
} from '../../../generated/prisma/core';
import { VError } from 'verror';
import { customAlphabet } from 'nanoid';
import { KeysService } from '../keys/keys.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AppConfig } from 'src/config/validate';
import { NearRpcService } from '../near-rpc/near-rpc.service';
import { PermissionsService } from './permissions.service';
import { ReadonlyService } from './readonly.service';
import { ReadonlyService as UsersReadonlyService } from '../users/readonly.service';
import { PermissionsService as UsersPermissionsService } from '../users/permissions.service';

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  13,
);

@Injectable()
export class ProjectsService {
  private projectRefPrefix: string;
  private mixpanelCredentials: string;
  private contractAddressValidationEnabled: string;
  constructor(
    private prisma: PrismaService,
    private keys: KeysService,
    private nearRpc: NearRpcService,
    private config: ConfigService<AppConfig>,
    private permissions: PermissionsService,
    private readonly: ReadonlyService,
    private users: UsersReadonlyService,
    private userPermissions: UsersPermissionsService,
  ) {
    this.projectRefPrefix = this.config.get('projectRefPrefix', {
      infer: true,
    });
    const token = this.config.get('analytics.token', {
      infer: true,
    });
    this.mixpanelCredentials = `Basic ${Buffer.from(token + ':').toString(
      'base64',
    )}`;
    this.contractAddressValidationEnabled = this.config.get(
      'featureEnabled.core.contractAddressValidation',
      { infer: true },
    );
  }

  async create(
    user: User,
    name: Project['name'],
    orgSlug?: Org['slug'],
    tutorial?: Project['tutorial'],
  ): Promise<{ name: Project['name']; slug: Project['slug'] }> {
    // TODO this org loader is temporary and should be removed once UI supports orgs.
    if (!orgSlug) {
      try {
        const { slug } = await this.users.getPersonalOrg(user);
        orgSlug = slug;
      } catch (e) {
        throw new VError(e, 'Failed to find personal org for user');
      }
    }

    await this.userPermissions.checkOrgMembership(user.id, orgSlug);

    let teamId;
    try {
      const team = await this.users.getDefaultTeam(orgSlug);
      teamId = team.id;
    } catch (e) {
      throw new VError(e, 'Failed to find team');
    }

    const isUnique = await this.isProjectNameUnique(name, orgSlug);
    if (!isUnique) {
      throw new VError(
        {
          info: {
            code: 'CONFLICT',
            response: 'DUPLICATE_PROJECT_NAME',
          },
        },
        'Project name is not unique',
      );
    }

    let project;

    const metadata = {
      createdBy: user.id,
      updatedBy: user.id,
    };

    try {
      let projectInput: Prisma.ProjectUncheckedCreateInput;

      if (tutorial) {
        projectInput = {
          orgSlug,
          slug: nanoid(),
          name,
          tutorial,
          teamProjects: {
            create: {
              teamId,
              ...metadata,
            },
          },
          environments: {
            createMany: {
              data: [
                {
                  name: 'Testnet',
                  net: 'TESTNET',
                  subId: 1,
                  ...metadata,
                },
              ],
            },
          },
          active: false,
          ...metadata,
        };
      } else {
        projectInput = {
          orgSlug,
          slug: nanoid(),
          name,
          teamProjects: {
            create: {
              teamId,
              ...metadata,
            },
          },
          environments: {
            createMany: {
              data: [
                {
                  name: 'Testnet',
                  net: 'TESTNET',
                  subId: 1,
                  ...metadata,
                },
                {
                  name: 'Mainnet',
                  net: 'MAINNET',
                  subId: 2,
                  ...metadata,
                },
              ],
            },
          },
          active: false,
          ...metadata,
        };
      }

      project = await this.prisma.project.create({
        data: projectInput,
        select: {
          name: true,
          slug: true,
          id: true,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while executing project creation query');
    }

    // generate RPC keys
    try {
      await this.keys.createProject(
        `${this.projectRefPrefix || ''}${project.id}_1`,
        'TESTNET',
      );
      if (!tutorial) {
        await this.keys.createProject(
          `${this.projectRefPrefix || ''}${project.id}_2`,
          'MAINNET',
        );
      }
    } catch (e) {
      // Attempt to delete the project, since API keys failed to generate.
      try {
        const deleteTeamProject = this.prisma.teamProject.deleteMany({
          where: {
            projectId: project.id,
          },
        });
        const deleteEnv = this.prisma.environment.deleteMany({
          where: {
            projectId: project.id,
          },
        });
        const deleteProject = this.prisma.project.delete({
          where: {
            id: project.id,
          },
        });
        await this.prisma.$transaction([
          deleteTeamProject,
          deleteEnv,
          deleteProject,
        ]);
      } catch (e) {
        console.error(
          'Failed to delete project after API keys failed to generate',
          e,
        );
      }
      throw new VError(e, 'Failed while generating API keys');
    }

    // If project creation worked fully, set the project to active.
    try {
      await this.prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          active: true,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while setting project to active');
    }

    return {
      name: project.name,
      slug: project.slug,
    };
  }

  async ejectTutorial(
    callingUser: User,
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  ): Promise<void> {
    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission({
      userId: callingUser.id,
      projectWhereUnique,
    });

    // check that project is valid for ejection
    let project;
    try {
      project = await this.prisma.project.findUnique({
        where: projectWhereUnique,
        select: {
          id: true,
          active: true,
          tutorial: true,
        },
      });
      if (!project) {
        throw new VError(
          { info: { code: 'BAD_PROJECT' } },
          'Project not found',
        );
      }
      if (!project.active) {
        throw new VError(
          { info: { code: 'BAD_PROJECT' } },
          'Project not active',
        );
      }
      if (!project.tutorial) {
        throw new VError(
          { info: { code: 'BAD_PROJECT' } },
          'Project not a tutorial',
        );
      }
    } catch (e) {
      throw new VError(
        e,
        'Failed while determining project eligibility for ejection',
      );
    }

    const projectKey = `${this.projectRefPrefix || ''}${project.id}_2`;

    // generate RPC keys
    try {
      // It's possible the user tried ejecting before and it failed.
      // Let's check if the project already exists.
      const mainnetKeys = await this.keys.fetchAllKeys(projectKey, 'MAINNET');
      if (!mainnetKeys.length) {
        await this.keys.createProject(projectKey, 'MAINNET');
      } else {
        const validKey = mainnetKeys.find((k) => !k.invalid);
        if (!validKey) {
          await this.keys.generate(projectKey, 'MAINNET');
        }
      }
    } catch (e) {
      throw new VError(
        e,
        'Failed while generating MAINNET API key during tutorial ejection',
      );
    }

    try {
      await this.prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          tutorial: null,
          environments: {
            create: {
              name: 'Mainnet',
              net: 'MAINNET',
              subId: 2,
              createdBy: callingUser.id,
              updatedBy: callingUser.id,
            },
          },
          updatedByUser: {
            connect: {
              id: callingUser.id,
            },
          },
        },
      });
    } catch (e) {
      try {
        await this.keys.invalidate(projectKey, 'MAINNET');
      } catch (e) {
        console.error(
          'Failed to invalidate MAINNET API Key after tutorial ejection failed',
          e,
        );
      }

      throw new VError(e, 'Failed while ejecting tutorial project');
    }
  }

  async delete(
    callingUser: User,
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  ): Promise<void> {
    // check that project is valid for deletion
    let project;
    try {
      project = await this.prisma.project.findUnique({
        where: projectWhereUnique,
        select: {
          id: true,
          active: true,
          tutorial: true,
        },
      });
      if (!project || !project.active) {
        throw new VError(
          { info: { code: 'BAD_PROJECT' } },
          'Project not found or project already inactive',
        );
      }
    } catch (e) {
      throw new VError(
        e,
        'Failed while determining project eligibility for deletion',
      );
    }

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission({
      userId: callingUser.id,
      projectWhereUnique,
    });

    await this.deleteApiKeys(project);

    // Soft delete the project and associated items.
    try {
      // TODO delete TeamProject, Environment, Contract associated with this Project.
      await this.prisma.project.update({
        where: projectWhereUnique,
        data: {
          active: false,
          updatedByUser: {
            connect: {
              id: callingUser.id,
            },
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting project');
    }
  }

  async deleteApiKeys(project: Project) {
    try {
      // Array of key names/ids to fetch from key service.
      const deleteKeys: [Net, number][] = [['TESTNET', 1]];

      // Tutorial projects have no Mainnet key.
      if (!project.tutorial) {
        deleteKeys.push(['MAINNET', 2]);
      }

      await Promise.all(
        deleteKeys.map((keyId) =>
          this.keys.invalidate(
            `${this.projectRefPrefix || ''}${project.id}_${keyId[1]}`,
            keyId[0],
          ),
        ),
      );
    } catch (e) {
      throw new VError(e, 'Failed to invalidate one or more project API keys');
    }
  }

  async checkUserPermission({
    userId,
    projectWhereUnique,
    environmentWhereUnique,
  }: {
    userId: number;
    projectWhereUnique?: Prisma.ProjectWhereUniqueInput;
    environmentWhereUnique?: Prisma.EnvironmentWhereUniqueInput;
  }): Promise<void> {
    // if the unique property provided is `id` then we can
    // reduce the number of subqueries by looking at the id
    // directly in the TeamProject table
    let teamProjectFilter;
    if (projectWhereUnique?.id) {
      teamProjectFilter = { projectId: projectWhereUnique.id };
    } else if (projectWhereUnique) {
      teamProjectFilter = { project: projectWhereUnique };
    } else if (environmentWhereUnique) {
      teamProjectFilter = {
        project: { environments: { some: environmentWhereUnique } },
      };
    }

    const res = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        team: {
          active: true,
          teamProjects: {
            some: {
              active: true,
              ...teamProjectFilter,
            },
          },
        },
      },
    });

    if (!res) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'User does not have rights to manage this project',
      );
    }
  }

  async addContract(
    callingUser: User,
    project: Project['slug'],
    subId: Environment['subId'],
    address: Contract['address'],
  ) {
    let net: Net;
    let environmentId: Environment['id'];
    try {
      const environment = await this.getActiveEnvironment(project, subId);
      net = environment.net;
      environmentId = environment.id;
    } catch (e) {
      throw new VError(
        e,
        'Failed while checking validity of adding contract to environment',
      );
    }

    // throw an error if the user doesn't have permission to perform this action
    // or the contract address does not exist on the blockchain.
    await Promise.all([
      this.checkUserPermission({
        userId: callingUser.id,
        environmentWhereUnique: { id: environmentId },
      }),
      this.checkContractAddressExists(net, address),
    ]);

    const contract = await this.findContract(project, subId, address);
    if (contract) {
      throw new VError(
        {
          info: {
            code: 'CONFLICT',
            response: 'DUPLICATE_CONTRACT_ADDRESS',
          },
        },
        'Address already exists on the project and environment',
      );
    }

    try {
      return await this.prisma.contract.create({
        data: {
          slug: nanoid(),
          address,
          environment: {
            connect: {
              id: environmentId,
            },
          },
          net,
          createdByUser: {
            connect: {
              id: callingUser.id,
            },
          },
          updatedByUser: {
            connect: {
              id: callingUser.id,
            },
          },
        },
        select: {
          id: true,
          slug: true,
          address: true,
          net: true,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while creating contract');
    }
  }

  // Checks if the contract address exists on the Near blockchain.
  private async checkContractAddressExists(
    net: Net,
    address: Contract['address'],
  ) {
    if (!this.contractAddressValidationEnabled) {
      return;
    }

    const status = await this.nearRpc.checkAccountExists(net, address);
    if (status === 'NOT_FOUND') {
      throw new VError(
        {
          info: {
            code: 'NOT_FOUND',
            response: 'ADDRESS_NOT_FOUND',
          },
        },
        'Contract address not found',
      );
    }
  }

  private async findContract(
    project: Project['slug'],
    subId: Environment['subId'],
    address: Contract['address'],
  ) {
    return await this.prisma.contract.findFirst({
      where: {
        active: true,
        address,
        environment: {
          subId,
          project: {
            slug: project,
          },
        },
      },
    });
  }

  async removeContract(
    callingUser: User,
    contractWhereUnique: Prisma.ContractWhereUniqueInput,
  ) {
    try {
      const contract = await this.prisma.contract.findUnique({
        where: contractWhereUnique,
        select: {
          id: true,
          environmentId: true,
          active: true,
        },
      });
      if (!contract) {
        throw new VError(
          { info: { code: 'BAD_CONTRACT' } },
          'Contract not found',
        );
      }
      if (!contract.active) {
        throw new VError(
          { info: { code: 'BAD_CONTRACT' } },
          'Contract not active',
        );
      }
      // throw an error if the user doesn't have permission to perform this action
      await this.checkUserPermission({
        userId: callingUser.id,
        environmentWhereUnique: {
          id: contract.environmentId,
        },
      });
    } catch (e) {
      throw new VError(
        e,
        'Failed while checking validity of deleting contract',
      );
    }

    // soft delete the contract
    try {
      await this.prisma.contract.update({
        where: contractWhereUnique,
        data: {
          active: false,
          updatedByUser: {
            connect: {
              id: callingUser.id,
            },
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting contract');
    }
  }

  async getContracts(
    callingUser: User,
    project: Project['slug'],
    subId: Environment['subId'],
  ) {
    const environment = await this.getActiveEnvironment(project, subId, true);

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission({
      userId: callingUser.id,
      environmentWhereUnique: { id: environment.id },
    });

    try {
      return await this.prisma.contract.findMany({
        where: {
          active: true,
          environmentId: environment.id,
        },
        select: {
          slug: true,
          net: true,
          address: true,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while getting list of contracts');
    }
  }

  async getContract(callingUser: User, slug: Contract['slug']) {
    await this.permissions.checkUserContractPermission(callingUser.id, slug);
    const { net, address } = await this.readonly.getContract(slug);
    return { slug, net, address };
  }

  /**
   *
   * @param projectWhereUnique
   * @param assert Should be set to true when this function is being called
   *               for an assertion and the full project info does not need
   *               to be returned
   * @returns full Prisma.Project is assert is false
   */
  async getActiveProject(
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
    assert = false,
  ) {
    // check that project is active
    const project = await this.prisma.project.findUnique({
      where: projectWhereUnique,
      ...(assert ? { select: { id: true, active: true } } : {}),
    });
    if (!project) {
      throw new VError({ info: { code: 'BAD_PROJECT' } }, 'Project not found');
    }
    if (!project.active) {
      throw new VError({ info: { code: 'BAD_PROJECT' } }, 'Project not active');
    }

    return project;
  }

  /**
   *
   * @param environmentWhereUnique
   * @param assert Should be set to true when this function is being called
   *               for an assertion and the full project info does not need
   *               to be returned
   * @returns full Prisma.Project is assert is false
   */
  async getActiveEnvironment(
    projectSlug: Project['slug'],
    subId: Environment['subId'],
    assert = false,
  ) {
    // check that project is active
    let environment;
    if (assert) {
      // quick check, only return minimal info
      environment = await this.prisma.environment.findFirst({
        where: {
          subId,
          project: {
            slug: projectSlug,
          },
        },
        select: { id: true, active: true, project: true },
      });
    } else {
      environment = await this.prisma.environment.findFirst({
        where: {
          subId,
          project: {
            slug: projectSlug,
          },
        },
        include: { project: true },
      });
    }
    if (!environment) {
      throw new VError(
        { info: { code: 'BAD_ENVIRONMENT' } },
        'Environment not found',
      );
    }
    if (!environment.active) {
      throw new VError(
        { info: { code: 'BAD_ENVIRONMENT' } },
        'Environment not active',
      );
    }
    if (!environment.project.active) {
      throw new VError(
        { info: { code: 'BAD_ENVIRONMENT' } },
        'Project not active',
      );
    }

    return environment;
  }

  async list(user: User) {
    const projects = await this.prisma.project.findMany({
      where: {
        active: true,
        teamProjects: {
          some: {
            active: true,
            team: {
              active: true,
              teamMembers: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        tutorial: true,
        active: true,
        org: {
          select: {
            name: true,
            slug: true,
            personalForUserId: true,
          },
        },
      },
    });

    return projects.map((p) => {
      const isPersonal = !!p.org.personalForUserId;
      return {
        ...p,
        org: {
          name: isPersonal ? undefined : p.org.name,
          slug: p.org.slug,
          isPersonal,
        },
      };
    });
  }

  async getEnvironments(
    callingUser: User,
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
    includeContracts = false,
  ) {
    let project;
    try {
      project = await this.getActiveProject(projectWhereUnique);
    } catch (e) {
      throw new VError(
        e,
        'Failed while checking validity of project for listing environments',
      );
    }

    await this.checkUserPermission({
      userId: callingUser.id,
      projectWhereUnique,
    });

    // this can be cleaned up, it was changed late to consolidate multiple network
    // calls
    const environments = await this.prisma.environment.findMany({
      where: {
        projectId: project.id,
        active: true,
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        subId: true,
        name: true,
        net: true,
        contracts: includeContracts
          ? {
              where: {
                active: true,
              },
            }
          : false,
      },
    });

    // return {
    // Note: scream test in removing this, can be reverted if necessary
    // project: {
    //   name: project.name,
    //   slug: project.slug,
    // },
    // environments,
    // };
    return environments;
  }

  async getEnvironmentDetails(
    callingUser: User,
    project: Project['slug'],
    subId: Environment['subId'],
  ) {
    const environment = await this.getActiveEnvironment(project, subId);

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission({
      userId: callingUser.id,
      environmentWhereUnique: { id: environment.id },
    });

    return environment;
  }

  async getProjectDetails(
    callingUser: User,
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  ) {
    await this.checkUserPermission({
      userId: callingUser.id,
      projectWhereUnique,
    });

    try {
      const { name, slug, tutorial } = await this.getActiveProject(
        projectWhereUnique,
      );
      return { name, slug, tutorial };
    } catch (e) {
      throw new VError(e, 'Failed while fetching project details');
    }
  }

  async isProjectNameUnique(name: Project['name'], orgSlug: Org['slug']) {
    try {
      const p = await this.prisma.project.findFirst({
        where: {
          orgSlug,
          name,
          active: true,
        },
        select: {
          slug: true,
        },
      });
      return !p;
    } catch (e) {
      throw new VError(e, 'Failed to guarantee project uniqueness');
    }
  }

  async getKeys(
    callingUser: User,
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  ) {
    await this.checkUserPermission({
      userId: callingUser.id,
      projectWhereUnique,
    });

    let project: Project;
    try {
      project = await this.getActiveProject(projectWhereUnique);
    } catch (e) {
      throw new VError(e, 'Failed while checking that project is active');
    }

    try {
      // Array of key names/ids to fetch from key service.
      const fetchKeys: [Net, number][] = [['TESTNET', 1]];

      // Tutorial projects have no Mainnet key.
      if (!project.tutorial) {
        fetchKeys.push(['MAINNET', 2]);
      }

      const keys = await Promise.all(
        fetchKeys.map((keyId) =>
          this.keys.fetch(
            `${this.projectRefPrefix || ''}${project.id}_${keyId[1]}`,
            keyId[0],
          ),
        ),
      );

      // Builds an object of the form:
      // {
      //   TESTNET: '{api_key}',
      //   MAINNET: '{api_key}'
      // }
      return Object.fromEntries(
        fetchKeys.map((keyId, i) => [keyId[0], keys[i]]),
      );
    } catch (e) {
      throw new VError(e, 'Failed to fetch keys from key management API');
    }
  }

  async rotateKey(
    callingUser: User,
    project: Project['slug'],
    subId: Environment['subId'],
  ) {
    const environment = await this.getActiveEnvironment(project, subId);

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission({
      userId: callingUser.id,
      environmentWhereUnique: { id: environment.id },
    });

    const keyId = `${this.projectRefPrefix || ''}${
      environment.projectId
    }_${subId}`;
    const net = subId === 2 ? 'MAINNET' : 'TESTNET';
    try {
      // Track the user's action.
      await this.prisma.userAction.create({
        data: {
          action: 'ROTATE_API_KEY',
          data: {
            net,
            keyId,
          },
          userId: callingUser.id,
        },
      });
      return { [net]: (await this.keys.rotate(keyId, net)).token };
    } catch (e) {
      throw new VError(e, `Failed to rotate key ${keyId} on net ${net}`);
    }
  }

  async getRpcUsage(
    callingUser: User,
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  ) {
    let project;
    try {
      project = await this.getActiveProject(projectWhereUnique, true);
    } catch (e) {
      throw new VError(e, 'Failed while checking that project is active');
    }

    await this.checkUserPermission({
      userId: callingUser.id,
      projectWhereUnique,
    });

    let keys: Record<Net, Array<string>>;
    try {
      // run requests in parallel
      const testnetKeyPromise = this.keys.fetchAll(
        `${this.projectRefPrefix || ''}${project.id}_1`,
        'TESTNET',
      );
      const mainnetKeyPromise = this.keys.fetchAll(
        `${this.projectRefPrefix || ''}${project.id}_2`,
        'MAINNET',
      );

      keys = {
        TESTNET: await testnetKeyPromise,
        MAINNET: await mainnetKeyPromise,
      };
    } catch (e) {
      throw new VError(e, 'Failed to fetch keys from key management API');
    }

    if (!keys.TESTNET.length) {
      throw new VError('No testnet keys found');
    }

    let keyList = keys.TESTNET;
    if (!keys.MAINNET.length) {
      // TODO check this does not cause issues for normal projects by being removed. It is
      // being removed last minute to fix tutorial projects
      //   throw new VError('No mainnet keys found');
    } else {
      keyList = keyList.concat(keys.MAINNET);
    }

    const endDateObject = new Date();
    const month = (endDateObject.getMonth() + 1).toString();
    const endDate = `${endDateObject.getFullYear()}-${
      month.length === 2 ? month : `0${month}`
    }-${endDateObject.getDate()}`;

    let usageData;
    try {
      const usageRes = await axios.get(
        this.config.get('analytics.url', { infer: true }),
        {
          params: {
            where: `properties["$distinct_id"] in ${JSON.stringify(keyList)}`,
            from_date: '2021-01-01', // safe start date before release of developer console
            to_date: endDate,
          },
          headers: {
            Authorization: this.mixpanelCredentials,
          },
        },
      );
      usageData = usageRes.data;
    } catch (e) {
      throw new VError(e, 'Failed while fetching usage data from Mixpanel');
    }

    return {
      keys,
      events: usageData,
    };
  }

  // Deletes the projects and api keys associated with a user's personal org.
  async deleteApiKeysByUser(user: User) {
    try {
      const projects = await this.prisma.project.findMany({
        where: {
          active: true,
          org: {
            personalForUserId: user.id,
          },
        },
      });
      await Promise.all(projects.map((p) => this.deleteApiKeys(p)));
    } catch (e) {
      throw new VError(
        e,
        `Failed to delete projects and API keys for user's personal org`,
      );
    }
  }

  // Deletes the projects and api keys associated with an org.
  async deleteApiKeysByOrg(orgSlug: Org['slug']) {
    try {
      const projects = await this.prisma.project.findMany({
        where: {
          active: true,
          org: {
            slug: orgSlug,
          },
        },
      });
      await Promise.all(projects.map((p) => this.deleteApiKeys(p)));
    } catch (e) {
      throw new VError(e, `Failed to delete projects and API keys for org`);
    }
  }
}
