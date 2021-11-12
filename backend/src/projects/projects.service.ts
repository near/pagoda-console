import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Project, Net, User, Contract } from '@prisma/client';
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
          TeamProject: {
            create: {
              teamId,
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
    await this.checkUserPermission(callingUser.id, projectWhereUnique);

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

  async checkUserPermission(
    userId: number,
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  ): Promise<void> {
    // if the unique property provided is `id` then we can
    // reduce the number of subqueries by looking at the id
    // directly in the TeamProject table
    let teamProjectFilter;
    if (projectWhereUnique.id) {
      teamProjectFilter = { projectId: projectWhereUnique.id };
    } else {
      teamProjectFilter = { project: projectWhereUnique };
    }

    const res = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        active: true,
        team: {
          active: true,
          TeamProject: {
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
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
    address: Contract['address'],
  ) {
    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission(callingUser.id, projectWhereUnique);

    let net: Net;
    let projectId: Project['id'];
    try {
      const project = await this.getActiveProject(projectWhereUnique);
      net = project.net;
      projectId = project.id;
    } catch (e) {
      throw new VError(
        e,
        'Failed while checking validity of adding contract to project',
      );
    }

    try {
      return await this.prisma.contract.create({
        data: {
          address,
          projectId,
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
          projectId: true,
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
      await this.checkUserPermission(callingUser.id, {
        id: contract.projectId,
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
    projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  ) {
    const project = await this.getActiveProject(projectWhereUnique, true);

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserPermission(callingUser.id, projectWhereUnique);

    try {
      return await this.prisma.contract.findMany({
        where: {
          active: true,
          projectId: project.id,
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

  async list(user: User) {
    return await this.prisma.project.findMany({
      where: {
        active: true,
        TeamProject: {
          some: {
            active: true,
            team: {
              active: true,
              TeamMember: {
                some: {
                  active: true,
                  userId: user.id,
                },
              },
            },
          },
        },
      },
    });
  }
}
