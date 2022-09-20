import { Module } from '@nestjs/common';
import { AbiService } from './abi.service';
import { AbiController } from './abi.controller';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from '@/src/core/projects/projects.module';

@Module({
  providers: [AbiService, PrismaService],
  controllers: [AbiController],
  imports: [ProjectsModule],
})
export class AbiModule {}
