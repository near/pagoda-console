import { Injectable } from '@nestjs/common';
import {
  Contract,
  Environment,
  Net,
  Project,
} from 'pagoda-console-database/clients/core';
import { PrismaService } from '../prisma.service';
import { VError } from 'verror';

@Injectable()
export class ReadonlyService {
  constructor(private prisma: PrismaService) {}

  async getEnvironmentNet(
    projectSlug: Project['slug'],
    subId: Environment['subId'],
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

  async getContract(slug: Contract['slug']): Promise<Contract> {
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
