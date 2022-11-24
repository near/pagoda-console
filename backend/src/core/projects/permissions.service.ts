import { Injectable } from '@nestjs/common';
import { User } from '@pc/database/clients/core';
import { PrismaService } from '../prisma.service';
import { VError } from 'verror';
import { Projects } from '@pc/common/types/core';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async checkUserProjectEnvPermission(
    userId: User['id'],
    slug: Projects.ProjectSlug,
    subId: Projects.EnvironmentId,
  ) {
    const res = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        team: {
          active: true,
          teamProjects: {
            some: {
              active: true,
              project: {
                active: true,
                slug,
                environments: {
                  some: {
                    active: true,
                    subId,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!res) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'User does not have rights to manage this project and environment',
      );
    }
  }

  async checkUserProjectPermission(
    userId: User['id'],
    slug: Projects.ProjectSlug,
  ) {
    const res = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        team: {
          active: true,
          teamProjects: {
            some: {
              active: true,
              project: {
                active: true,
                slug,
              },
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

  async checkUserContractPermission(
    userId: User['id'],
    slug: Projects.ContractSlug,
  ) {
    const res = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        team: {
          active: true,
          teamProjects: {
            some: {
              active: true,
              project: {
                active: true,
                environments: {
                  some: {
                    active: true,
                    contracts: {
                      some: {
                        active: true,
                        slug,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!res) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'User does not have rights to manage this contract',
      );
    }
  }
}
