import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  providers: [AlertsService, PrismaService],
  controllers: [AlertsController],
  imports: [ProjectsModule, PrismaService],
})
export class AlertsModule {}
