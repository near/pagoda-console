import { Injectable } from '@nestjs/common';
import { Contract, Net } from '@pc/database/clients/core';
import { PrismaService } from '../prisma.service';
import { VError } from 'verror';
import { Projects } from '@pc/common/types/core';

@Injectable()
export class ReadonlyService {
  constructor(private prisma: PrismaService) {}

  async getEnvironmentNet(
    projectSlug: Projects.ProjectSlug,
    subId: Projects.EnvironmentId,
  ): Promise<Net> {
    const environment = await this.prisma.environment.findFirst({
      where: {
        subId,
        project: {
          slug: projectSlug,
        },
      },
      select: { net: true },
    });

    if (!environment) {
      throw new VError('Environment not found');
    }

    return environment.net;
  }

  async getContract(slug: Projects.ContractSlug): Promise<Contract> {
    const contract = await this.prisma.contract.findUnique({
      where: {
        slug,
      },
    });

    if (!contract) {
      throw new VError('Contract not found');
    }

    return contract;
  }
}
