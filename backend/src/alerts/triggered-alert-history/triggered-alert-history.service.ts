import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Alert, TriggeredAlert } from 'generated/prisma/alerts';
import { PrismaService } from '../prisma.service';
import { ReadonlyService as ProjectsReadonlyService } from 'src/projects/readonly.service';
import { AppConfig } from 'src/config/validate';
import { ConfigService } from '@nestjs/config';
import { PermissionsService as ProjectPermissionsService } from 'src/projects/permissions.service';
import { AlertsService } from '../alerts.service';
import { MatchingRule } from '../serde/db.types';

type TriggeredAlertWithAlert = TriggeredAlert & {
  alert: Alert;
};

@Injectable()
export class TriggeredAlertHistoryService {
  constructor(
    private prisma: PrismaService,
    private projectPermissions: ProjectPermissionsService,
    private alertsService: AlertsService,
    private projects: ProjectsReadonlyService,
    private config: ConfigService<AppConfig>,
  ) {}

  async listTriggeredAlerts(
    user: User,
    projectSlug: Alert['projectSlug'],
    environmentSubId: Alert['environmentSubId'],
  ) {
    // todo return type ?
    await this.projectPermissions.checkUserProjectEnvPermission(
      user.id,
      projectSlug,
      environmentSubId,
    );

    const triggeredAlerts = await this.prisma.triggeredAlert.findMany({
      skip: 0,
      take: 20,
      orderBy: {
        id: 'desc',
      },
      include: {
        alert: true,
      },
      //   Seems likely we'll want one find by alertId and one by project id
      //   where: {
      //     active: true,
      //     projectSlug,
      //     environmentSubId,
      //   },
    });

    return triggeredAlerts.map((a) => this.toTriggeredAlertDto(a));
  }

  private toTriggeredAlertDto(triggeredAlert: TriggeredAlertWithAlert) {
    const {
      triggeredAlertReferenceId,
      alert,
      triggeredInBlockHash,
      triggeredInTransactionHash,
      triggeredInReceiptId,
      triggeredAt,
    } = triggeredAlert;
    const extraData: object = triggeredAlert.extraData as object;
    const rule = alert.matchingRule as object as MatchingRule;

    return {
      triggeredAlertReferenceId,
      name: alert.name,
      type: this.alertsService.toAlertType(rule),
      triggeredInBlockHash,
      triggeredInTransactionHash,
      triggeredInReceiptId,
      triggeredAt,
      extraData,
    };
  }
}
