import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { SerdeModule } from './serde/serde.module';

@Module({
  providers: [AlertsService, PrismaService],
  controllers: [AlertsController],
  imports: [ProjectsModule, PrismaService, SerdeModule],
})
export class AlertsModule {}
