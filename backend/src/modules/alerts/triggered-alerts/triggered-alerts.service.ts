import { Injectable } from '@nestjs/common';
import { User } from '@pc/database/clients/core';
import { Alert, Prisma, TriggeredAlert } from '@pc/database/clients/alerts';
import { PrismaService } from '../prisma.service';
import { PermissionsService as ProjectPermissionsService } from '../../../core/projects/permissions.service';
import { AlertsService } from '../alerts.service';
import {
  AcctBalMatchingRule,
  EventMatchingRule,
  FnCallMatchingRule,
  TxMatchingRule,
} from '../serde/db.types';
import { VError } from 'verror';

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
  ) {
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

  public async getTriggeredAlertDetails(
    user: User,
    slug: TriggeredAlert['slug'],
  ) {
    const triggeredAlert = await this.prisma.triggeredAlert.findFirst({
      where: {
        slug,
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

    // Confirm the user is a member of the triggered alert's project.
    const { projectSlug, environmentSubId } = triggeredAlert.alert;
    await this.projectPermissions.checkUserProjectEnvPermission(
      user.id,
      projectSlug,
      environmentSubId,
    );

    return this.toTriggeredAlertDto(triggeredAlert);
  }

  private determineWhereClause(
    pagingDateTime: Date,
    projectSlug: string,
    environmentSubId: number,
    alertId?: number,
  ): Prisma.TriggeredAlertWhereInput {
    const listWhere: Prisma.TriggeredAlertWhereInput = {
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
      listWhere.alert!.id = alertId;
    }
    return listWhere;
  }

  private toTriggeredAlertDto(
    triggeredAlert: TriggeredAlert & {
      alert: Alert;
    },
  ) {
    const {
      slug,
      alert,
      triggeredInBlockHash,
      triggeredInTransactionHash,
      triggeredInReceiptId,
      triggeredAt,
    } = triggeredAlert;
    const extraData = triggeredAlert.extraData as Record<string, unknown>;
    const rule = alert.matchingRule as object as
      | TxMatchingRule
      | FnCallMatchingRule
      | EventMatchingRule
      | AcctBalMatchingRule;

    return {
      slug,
      name: alert.name,
      alertId: alert.id,
      type: this.alertsService.toAlertType(rule),
      triggeredInBlockHash,
      triggeredInTransactionHash,
      triggeredInReceiptId,
      triggeredAt: triggeredAt.toString(),
      extraData,
    };
  }
}
