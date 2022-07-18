import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Alert, TriggeredAlert } from 'generated/prisma/alerts';
import { PrismaService } from '../prisma.service';
import { PermissionsService as ProjectPermissionsService } from 'src/projects/permissions.service';
import { AlertsService } from '../alerts.service';
import { MatchingRule } from '../serde/db.types';
import { TriggeredAlertsResponseDto } from '../dto';

type TriggeredAlertWithAlert = TriggeredAlert & {
  alert: Alert;
};

@Injectable()
export class TriggeredAlertsService {
  constructor(
    private prisma: PrismaService,
    private projectPermissions: ProjectPermissionsService,
    private alertsService: AlertsService,
  ) {}

  async listTriggeredAlertsByProject(
    user: User,
    projectSlug: Alert['projectSlug'],
    environmentSubId: Alert['environmentSubId'],
    skip: number,
    take: number,
    pagingDateTime: Date,
    alertId?: number,
  ): Promise<TriggeredAlertsResponseDto> {
    await this.projectPermissions.checkUserProjectEnvPermission(
      user.id,
      projectSlug,
      environmentSubId,
    );

    const countWhere = this.determineWhereClause(
      pagingDateTime,
      projectSlug,
      environmentSubId,
      alertId,
    );
    const countPromise = this.prisma.triggeredAlert.count({
      where: countWhere,
    });

    const listWhere = this.determineWhereClause(
      pagingDateTime,
      projectSlug,
      environmentSubId,
      alertId,
    );
    const triggeredAlertsPromise = this.prisma.triggeredAlert.findMany({
      skip,
      take,
      orderBy: {
        triggeredAt: 'desc',
      },
      include: {
        alert: true,
      },
      where: listWhere,
    });

    const [count, triggeredAlerts] = await Promise.all([
      countPromise,
      triggeredAlertsPromise,
    ]);
    const page = triggeredAlerts.map((a) => this.toTriggeredAlertDto(a));
    return {
      count,
      page,
    };
  }

  private determineWhereClause(
    pagingDateTime: Date,
    projectSlug: string,
    environmentSubId: number,
    alertId: number,
  ) {
    const listWhere: Record<string, any> = {
      alert: {
        projectSlug,
        environmentSubId,
      },
    };
    if (pagingDateTime) {
      listWhere.triggeredAt = {
        lte: pagingDateTime,
      };
    }
    if (alertId) {
      listWhere.alert.id = alertId;
    }
    return listWhere;
  }

  private toTriggeredAlertDto(triggeredAlert: TriggeredAlertWithAlert) {
    const {
      triggeredAlertSlug,
      alert,
      triggeredInBlockHash,
      triggeredInTransactionHash,
      triggeredInReceiptId,
      triggeredAt,
    } = triggeredAlert;
    const extraData: Record<string, unknown> =
      triggeredAlert.extraData as Record<string, unknown>;
    const rule = alert.matchingRule as object as MatchingRule;

    return {
      triggeredAlertSlug,
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
