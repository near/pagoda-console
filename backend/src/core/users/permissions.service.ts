import { Injectable } from '@nestjs/common';
import { User } from '@pc/database/clients/core';
import { PrismaService } from '../prisma.service';
import { VError } from 'verror';
import { Projects } from '@pc/common/types/core';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async checkOrgMembership(userId: User['id'], orgSlug: Projects.OrgSlug) {
    const res = await this.prisma.orgMember.findUnique({
      where: {
        orgSlug_userId: {
          userId,
          orgSlug,
        },
      },
    });

    if (!res) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'User does not have rights to manage this org',
      );
    }
  }
}
