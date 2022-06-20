import { Injectable } from '@nestjs/common';
import { Environment, Net, Project } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
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
}
