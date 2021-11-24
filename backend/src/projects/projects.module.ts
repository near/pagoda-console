import { Module } from '@nestjs/common';
import { KeysModule } from 'src/keys/keys.module';
import { KeysService } from 'src/keys/keys.service';
import { PrismaService } from 'src/prisma.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  providers: [ProjectsService, PrismaService],
  controllers: [ProjectsController],
  imports: [PrismaService, KeysModule],
})
export class ProjectsModule { }
