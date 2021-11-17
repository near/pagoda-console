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

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProjectCreateInput, user: User): Promise<Project> {
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
          ...data,
          teamProjects: {
            create: {
              teamId,
            },
          },
          environments: {
            createMany: {
              data: [
                { name: 'Mainnet', net: 'MAINNET' },
                { name: 'Testnet', net: 'TESTNET' },
              ],
            },
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while executing project creation query');
    }
    return project;
  }

  async delete(
    callingUser: User,
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  ): Promise<void> {
    // check that project is valid for deletion
    try {
      const project = await this.prisma.project.findUnique({
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
        project: { environment: { some: environmentWhereUnique } },
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
    environmentWhereUnique: Prisma.EnvironmentWhereUniqueInput,
    address: Contract['address'],
  ) {
    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission({
      userId: callingUser.id,
      environmentWhereUnique,
    });

    let net: Net;
    let environmentId: Environment['id'];
    try {
      const environment = await this.getActiveEnvironment(
        environmentWhereUnique,
      );
      net = environment.net;
      environmentId = environment.id;
    } catch (e) {
      throw new VError(
        e,
        'Failed while checking validity of adding contract to environment',
      );
    }

    try {
      return await this.prisma.contract.create({
        data: {
          address,
          environmentId,
          net,
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
    environmentWhereUnique: Prisma.EnvironmentWhereUniqueInput,
  ) {
    const environment = await this.getActiveEnvironment(
      environmentWhereUnique,
      true,
    );

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission({
      userId: callingUser.id,
      environmentWhereUnique,
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
    environmentWhereUnique: Prisma.EnvironmentWhereUniqueInput,
    assert = false,
  ) {
    // check that project is active
    const environment = await this.prisma.environment.findUnique({
      where: environmentWhereUnique,
      ...(assert ? { select: { id: true, active: true } } : {}),
      include: {
        project: true,
      },
    });
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
    // TODO test this last case
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
  ) {
    await this.checkUserPermission({
      userId: callingUser.id,
      projectWhereUnique,
    });

    let project;
    try {
      project = await this.getActiveProject(projectWhereUnique, true);
    } catch (e) {
      throw new VError(
        e,
        'Failed while checking validity of project for listing environments',
      );
    }

    return this.prisma.environment.findMany({
      where: {
        projectId: project.id,
        active: true,
      },
    });
  }
}
