import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Org, Team, User } from '@pc/database/clients/core';
import { VError } from 'verror';

@Injectable()
export class ReadonlyService {
  constructor(private prisma: PrismaService) {}

  async getPersonalOrg(user: User): Promise<Pick<Org, 'slug' | 'name'>> {
    const org = this.prisma.org.findUnique({
      where: {
        personalForUserId: user.id,
      },
      select: {
        slug: true,
        name: true,
      },
    });

    if (!org) {
      throw new VError("Failed to find user's personal org");
    }
    return org;
  }

  async getDefaultTeam(orgSlug: Org['slug']): Promise<Team> {
    const team = this.prisma.team.findFirst({
      where: {
        name: {
          equals: 'default',
        },
        org: {
          slug: orgSlug,
        },
      },
    });

    if (!team) {
      throw new VError('Failed to find default team for org');
    }
    return team;
  }
}
