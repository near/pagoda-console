import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  providers: [ProjectsService, PrismaService],
  controllers: [ProjectsController],
  imports: [PrismaService],
})
export class ProjectsModule {}
