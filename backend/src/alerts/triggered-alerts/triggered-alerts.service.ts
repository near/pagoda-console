import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Alert, TriggeredAlert } from 'generated/prisma/alerts';
import { PrismaService } from '../prisma.service';
import { PermissionsService as ProjectPermissionsService } from 'src/projects/permissions.service';
import { AlertsService } from '../alerts.service';
import { MatchingRule } from '../serde/db.types';
import {
  TriggeredAlertDetailsResponseDto,
  TriggeredAlertsResponseDto,
} from '../dto';
import { VError } from 'verror';

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

  public async triggeredAlertDetails(
    user: User,
    triggeredAlertSlug: TriggeredAlert['triggeredAlertSlug'],
  ): Promise<TriggeredAlertDetailsResponseDto> {
    const triggeredAlert = await this.checkUserTriggeredAlertPermission(
      user.id,
      triggeredAlertSlug,
    );
    return this.toTriggeredAlertDto(triggeredAlert);
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

  // Confirm the user is a member of the triggered alert's project.
  private async checkUserTriggeredAlertPermission(
    userId: User['id'],
    triggeredAlertSlug: TriggeredAlert['triggeredAlertSlug'],
  ): Promise<TriggeredAlertWithAlert> {
    const triggeredAlert: TriggeredAlertWithAlert =
      await this.prisma.triggeredAlert.findFirst({
        where: {
          triggeredAlertSlug,
        },
        include: {
          alert: true,
        },
      });

    if (!triggeredAlert) {
      throw new VError(
        { info: { code: 'BAD_ALERT' } },
        'Triggered Alert not found',
      );
    }

    const { projectSlug, environmentSubId } = triggeredAlert.alert;
    await this.projectPermissions.checkUserProjectEnvPermission(
      userId,
      projectSlug,
      environmentSubId,
    );
    return triggeredAlert;
  }
}
