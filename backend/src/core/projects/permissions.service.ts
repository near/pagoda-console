import { Injectable } from '@nestjs/common';
import {
  User,
  Project,
  Environment,
  Contract,
} from '../../../generated/prisma/core';
import { PrismaService } from '../prisma.service';
import { VError } from 'verror';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async checkUserProjectEnvPermission(
    userId: User['id'],
    slug: Project['slug'],
    subId: Environment['subId'],
  ) {
    const res = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        active: true, // TODO remove once orgs is merged.
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

  async checkUserProjectPermission(userId: User['id'], slug: Project['slug']) {
    const res = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        active: true,
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
    slug: Contract['slug'],
  ) {
    const res = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        active: true,
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
