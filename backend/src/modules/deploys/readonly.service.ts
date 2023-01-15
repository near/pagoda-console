import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Repository } from '@/../database/clients/deploys';

@Injectable()
export class ReadonlyService {
  constructor(private prisma: PrismaService) {}

  async getRepositories(
    projectSlug: Repository['projectSlug'],
  ): Promise<Repository[]> {
    return this.prisma.repository.findMany({
      where: {
        projectSlug,
      },
    });
  }
}
