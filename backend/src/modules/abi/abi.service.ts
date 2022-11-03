import { Abi } from '@pc/database/clients/abi';
import { User } from '@pc/database/clients/core';
import { Injectable } from '@nestjs/common';
import { ABI } from './abi';
import { PrismaService } from './prisma.service';
import { PermissionsService as ProjectPermissionsService } from '../../core/projects/permissions.service';
import { VError } from 'verror';

@Injectable()
export class AbiService {
  constructor(
    private prisma: PrismaService,
    private projectPermissions: ProjectPermissionsService,
  ) {}

  async addContractAbi(
    user: User,
    contractSlug: Abi['contractSlug'],
    abi: ABI,
  ) {
    await this.projectPermissions.checkUserContractPermission(
      user.id,
      contractSlug,
    );

    let createdAbi;
    try {
      createdAbi = await this.prisma.abi.create({
        data: {
          contractSlug,
          abi: abi as object,
          createdBy: user.id,
        },
      });
    } catch (e: any) {
      throw new VError(e, 'Failed while creating abi');
    }

    return { contractSlug, abi: createdAbi.abi };
  }

  async getContractAbi(user: User, contractSlug: Abi['contractSlug']) {
    await this.projectPermissions.checkUserContractPermission(
      user.id,
      contractSlug,
    );

    let abi;
    try {
      abi = await this.prisma.abi.findFirst({
        where: {
          contractSlug,
        },
        select: {
          contractSlug: true,
          abi: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch (e: any) {
      throw new VError(e, 'Failed while getting ABI');
    }

    if (!abi) {
      throw new VError(
        {
          info: {
            code: 'NOT_FOUND',
            response: 'ABI_NOT_FOUND',
          },
        },
        'ABI not found for contract',
      );
    }

    return abi;
  }
}
