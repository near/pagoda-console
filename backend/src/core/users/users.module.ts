import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  providers: [UsersService, PrismaService],
  imports: [PrismaService, ProjectsModule],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
