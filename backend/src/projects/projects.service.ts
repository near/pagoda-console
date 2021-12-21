import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Prisma,
  Project,
  Net,
  User,
  Contract,
  Environment,
} from '@prisma/client';
import { VError } from 'verror';
import { customAlphabet } from 'nanoid';
import { GetProjectDetailsSchema } from './dto';
import { KeysService } from 'src/keys/keys.service';
import { UserInfo } from 'firebase-admin/auth';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  13,
);

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private keys: KeysService,
    private config: ConfigService,
  ) { }

  async create(
    user: User,
    name: Project['name'],
  ): Promise<{ name: Project['name']; slug: Project['slug']; }> {
    let teamId;
    try {
      const teamFind = await this.prisma.teamMember.findFirst({
        where: {
          userId: user.id,
          active: true,
        },
        select: {
          teamId: true,
        },
      });

      // will throw if no team found
      if (!teamFind) {
        throw new VError('Query to find team for user came back empty');
      }
      teamId = teamFind.teamId;
    } catch (e) {
      throw new VError(e, 'Failed to find team');
    }

    let project;
    try {
      project = await this.prisma.project.create({
        data: {
          slug: nanoid(),
          name,
          teamProjects: {
            create: {
              teamId,
            },
          },
          environments: {
            createMany: {
              data: [
                { name: 'Testnet', net: 'TESTNET', subId: 1 },
                { name: 'Mainnet', net: 'MAINNET', subId: 2 },
              ],
            },
          },
        },
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
        `${this.config.get('PROJECT_REF_PREFIX') || ''}${project.id}_1`,
        'TESTNET',
      );
      await this.keys.createProject(
        `${this.config.get('PROJECT_REF_PREFIX') || ''}${project.id}_2`,
        'MAINNET',
      );
    } catch (e) {
      // ! TODO clean up project since it did not create successfully, or at least set inactive
      throw new VError(e, 'Failed while generating API keys');
    }
    return {
      name: project.name,
      slug: project.slug,
    };
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
        },
      });
      if (!project || !project.active) {
        throw new VError(
          { info: { code: 'BAD_PROJECT' } },
          'Project not found or project already invactive',
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

    try {
      const testnetKeyPromise = this.keys.invalidate(
        `${this.config.get('PROJECT_REF_PREFIX') || ''}${project.id}_1`,
        'TESTNET',
      );
      const mainnetKeyPromise = this.keys.invalidate(
        `${this.config.get('PROJECT_REF_PREFIX') || ''}${project.id}_2`,
        'MAINNET',
      );
      await Promise.all([testnetKeyPromise, mainnetKeyPromise]);
    } catch (e) {
      throw new VError(
        e,
        'Failed to invalidate one or more keys while deleting project',
      );
    }

    // soft delete the project
    try {
      await this.prisma.project.update({
        where: projectWhereUnique,
        data: {
          active: false,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting project');
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
        active: true,
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
    await this.checkUserPermission({
      userId: callingUser.id,
      environmentWhereUnique: { id: environmentId },
    });

    try {
      return await this.prisma.contract.create({
        data: {
          address,
          environmentId,
          net,
        },
        select: {
          id: true,
          address: true,
          net: true,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while creating contract');
    }
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
      });
    } catch (e) {
      throw new VError(e, 'Failed while getting list of contracts');
    }
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
    return await this.prisma.project.findMany({
      where: {
        active: true,
        teamProjects: {
          some: {
            active: true,
            team: {
              active: true,
              teamMembers: {
                some: {
                  active: true,
                  userId: user.id,
                },
              },
            },
          },
        },
      },
      include: {
        environments: true,
      },
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
      const { name, slug } = await this.getActiveProject(projectWhereUnique);
      return { name, slug };
    } catch (e) {
      throw new VError(e, 'Failed while fetching project details');
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

    let project;
    try {
      project = await this.getActiveProject(projectWhereUnique, true);
    } catch (e) {
      throw new VError(e, 'Failed while checking that project is active');
    }

    try {
      // run requests in parallel
      const testnetKeyPromise = this.keys.fetch(
        `${this.config.get('PROJECT_REF_PREFIX') || ''}${project.id}_1`,
        'TESTNET',
      );
      const mainnetKeyPromise = this.keys.fetch(
        `${this.config.get('PROJECT_REF_PREFIX') || ''}${project.id}_2`,
        'MAINNET',
      );

      return {
        TESTNET: await testnetKeyPromise,
        MAINNET: await mainnetKeyPromise,
      };
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

    const keyId = `${this.config.get('PROJECT_REF_PREFIX') || ''}${environment.projectId
      }_${subId}`;
    const net = subId === 2 ? 'MAINNET' : 'TESTNET';
    try {
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
        `${this.config.get('PROJECT_REF_PREFIX') || ''}${project.id}_1`,
        'TESTNET',
      );
      const mainnetKeyPromise = this.keys.fetchAll(
        `${this.config.get('PROJECT_REF_PREFIX') || ''}${project.id}_2`,
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
    if (!keys.MAINNET.length) {
      throw new VError('No mainnet keys found');
    }

    const endDateObject = new Date();
    const month = (endDateObject.getMonth() + 1).toString();
    const endDate = `${endDateObject.getFullYear()}-${month.length === 2 ? month : `0${month}`
      }-${endDateObject.getDate()}`;

    let usageData;
    try {
      const usageRes = await axios.get(this.config.get('MIXPANEL_API'), {
        params: {
          where: `properties["$distinct_id"] in ${JSON.stringify(
            keys.TESTNET.concat(keys.MAINNET),
          )}`,
          from_date: '2021-01-01', // safe start date before release of developer console
          to_date: endDate,
        },
        headers: {
          Authorization: 'Basic OTdjOTg2MzZjMjIzMGY0YzFhNTgxYmVlYjUzM2VjMjM6',
        },
      });
      usageData = usageRes.data;
    } catch (e) {
      throw new VError(e, 'Failed while fetching usage data from Mixpanel');
    }

    return {
      keys,
      events: usageData,
    };
  }
}
