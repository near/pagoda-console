import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Alert,
  WebhookDestination,
  AlertRuleKind,
} from '../../generated/prisma/alerts';

// TODO should we re-export these types from the core module? So there is no dependency on the core prisma/client
import { User, Project } from '@prisma/client';
import { PermissionsService as ProjectPermissionsService } from 'src/projects/permissions.service';

import { customAlphabet } from 'nanoid';

import { PrismaService } from './prisma.service';
import { VError } from 'verror';
import { NumberComparator, RuleType, Net } from './types';
import { RuleSerializerService } from './serde/rule-serializer/rule-serializer.service';
import { RuleDeserializerService } from './serde/rule-deserializer/rule-deserializer.service';
import { AcctBalMatchingRule, MatchingRule } from './serde/db.types';

type TxRuleSchema = {
  rule: {
    contract: string;
  };
};

type FnCallRuleSchema = {
  rule: {
    contract: string;
    function: string;
  };
};

type EventRuleSchema = {
  rule: {
    contract: string;
    standard: string;
    version: string;
    event: string;
  };
};

type AcctBalRuleSchema = {
  rule: {
    contract: string;
    comparator: NumberComparator;
    amount: number;
  };
};

type CreateAlertBaseSchema = {
  name?: Alert['name'];
  type: RuleType;
  projectSlug: Alert['projectSlug'];
  environmentSubId: Alert['environmentSubId'];
  net: Net;
  webhookDestinations?: Array<WebhookDestination['id']>;
};
type CreateTxAlertSchema = CreateAlertBaseSchema & TxRuleSchema;
type CreateFnCallAlertSchema = CreateAlertBaseSchema & FnCallRuleSchema;
type CreateEventAlertSchema = CreateAlertBaseSchema & EventRuleSchema;
type CreateAcctBalAlertSchema = CreateAlertBaseSchema & AcctBalRuleSchema;

type CreateWebhookDestinationSchema = {
  name?: WebhookDestination['name'];
  url: WebhookDestination['url'];
  project: WebhookDestination['projectSlug'];
};

type CreateWebhookDestinationResponse = {
  id: WebhookDestination['id'];
  name?: WebhookDestination['name'];
  url: WebhookDestination['url'];
  projectSlug: WebhookDestination['projectSlug'];
  secret: WebhookDestination['secret'];
};

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12,
);

type AlertWithDestinations = Alert & {
  webhookDeliveries: {
    webhookDestination: WebhookDestination;
  }[];
};

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private projectPermissions: ProjectPermissionsService,
    private ruleSerializer: RuleSerializerService,
    private ruleDeserializer: RuleDeserializerService,
  ) {}

  async createTxSuccessAlert(user: User, alert: CreateTxAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.rule.contract;
    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name: alert.name || `Successful transaction in ${address}`,
      },
      AlertRuleKind.ACTIONS,
      this.ruleSerializer.toTxSuccessJson(alert.rule),
    );

    return this.createAlert(alertInput);
  }

  async createTxFailureAlert(user: User, alert: CreateTxAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.rule.contract;
    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name: alert.name || `Failed transaction in ${address}`,
      },
      AlertRuleKind.ACTIONS,
      this.ruleSerializer.toTxFailureJson(alert.rule),
    );

    return this.createAlert(alertInput);
  }

  async createFnCallAlert(user: User, alert: CreateFnCallAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.rule.contract;
    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name:
          alert.name || `Function ${alert.rule.function} called in ${address}`,
      },
      AlertRuleKind.ACTIONS,
      this.ruleSerializer.toFnCallJson(alert.rule),
    );

    return this.createAlert(alertInput);
  }

  async createEventAlert(user: User, alert: CreateEventAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.rule.contract;
    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name: alert.name || `Event ${alert.rule.event} logged in ${address}`,
      },
      AlertRuleKind.EVENTS,
      this.ruleSerializer.toEventJson(alert.rule),
    );

    return this.createAlert(alertInput);
  }

  async createAcctBalAlert(user: User, alert: CreateAcctBalAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.rule.contract;
    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name: alert.name || `Account balance changed in ${address}`,
      },
      AlertRuleKind.STATE_CHANGES,
      this.ruleSerializer.toAcctBalJson(
        alert.rule,
        alert.type === 'ACCT_BAL_PCT',
      ),
    );

    return this.createAlert(alertInput);
  }

  private buildCreateAlertInput(
    user: User,
    alert: CreateAlertBaseSchema,
    alertRuleKind: AlertRuleKind,
    matchingRule,
  ): Prisma.AlertCreateInput {
    const {
      name,
      projectSlug,
      environmentSubId,
      net: chainId,
      webhookDestinations,
    } = alert;

    const alertInput: Prisma.AlertCreateInput = {
      name,
      alertRuleKind,
      matchingRule,
      projectSlug,
      environmentSubId,
      chainId,
      createdBy: user.id,
      updatedBy: user.id,
      webhookDeliveries: {
        createMany: {
          data: webhookDestinations
            ? webhookDestinations.map((el) => ({
                webhookDestinationId: el,
                createdBy: user.id,
                updatedBy: user.id,
              }))
            : [],
        },
      },
    };

    return alertInput;
  }

  private async createAlert(data: Prisma.AlertCreateInput) {
    try {
      const alert = await this.prisma.alert.create({
        data,
        include: {
          webhookDeliveries: {
            select: {
              webhookDestination: {},
            },
          },
        },
      });

      return this.toAlertDto(alert);
    } catch (e) {
      throw new VError(e, 'Failed while executing alert creation query');
    }
  }

  async updateAlert(
    callingUser: User,
    id: Alert['id'],
    name?: Alert['name'],
    isPaused?: Alert['isPaused'],
  ) {
    await this.checkUserAlertPermission(callingUser.id, id);

    try {
      const alert = await this.prisma.alert.update({
        where: {
          id,
        },
        data: {
          name,
          isPaused,
          updatedBy: callingUser.id,
        },
        include: {
          webhookDeliveries: {
            select: {
              webhookDestination: {},
            },
          },
        },
      });
      return this.toAlertDto(alert);
    } catch (e) {
      throw new VError(e, 'Failed while executing alert update query');
    }
  }

  async listAlerts(
    user: User,
    projectSlug: Alert['projectSlug'],
    environmentSubId: Alert['environmentSubId'],
  ) {
    await this.projectPermissions.checkUserProjectEnvPermission(
      user.id,
      projectSlug,
      environmentSubId,
    );

    const alerts = await this.prisma.alert.findMany({
      where: {
        active: true,
        projectSlug,
        environmentSubId,
      },
      include: {
        webhookDeliveries: {
          select: {
            webhookDestination: {},
          },
        },
      },
    });

    return alerts.map((a) => this.toAlertDto(a));
  }

  async getAlertDetails(callingUser: User, id: Alert['id']) {
    try {
      await this.checkUserAlertPermission(callingUser.id, id);

      const alert = await this.prisma.alert.findUnique({
        where: {
          id,
        },
        include: {
          webhookDeliveries: {
            select: {
              webhookDestination: {},
            },
          },
        },
      });

      return this.toAlertDto(alert);
    } catch (e) {
      throw new VError(e, 'Failed to get alert rule details');
    }
  }

  private toAlertDto(alert: AlertWithDestinations) {
    const { id, name, isPaused, projectSlug, environmentSubId, matchingRule } =
      alert;
    const rule = matchingRule as object as MatchingRule;
    return {
      id,
      type: this.toAlertType(rule),
      name,
      isPaused,
      projectSlug,
      environmentSubId,
      rule: this.ruleDeserializer.toRuleDto(rule),
      webhookDeliveries: alert.webhookDeliveries,
    };
  }

  private toAlertType(rule: MatchingRule): RuleType {
    if (rule.rule === 'ACTION_ANY' && rule.status === 'SUCCESS') {
      return 'TX_SUCCESS';
    }

    if (rule.rule === 'ACTION_ANY' && rule.status === 'FAIL') {
      return 'TX_FAILURE';
    }

    if (rule.rule === 'ACTION_FUNCTION_CALL') {
      return 'FN_CALL';
    }

    if (rule.rule === 'EVENT_ANY') {
      return 'EVENT';
    }

    if (rule.rule === 'STATE_CHANGE_ACCOUNT_BALANCE') {
      return (rule as AcctBalMatchingRule).percentage
        ? 'ACCT_BAL_PCT'
        : 'ACCT_BAL_NUM';
    }

    throw new VError('Failed while deserializing alert type', {
      rule: rule.rule,
      status: rule.status,
    });
  }

  async deleteAlert(callingUser: User, id: Alert['id']): Promise<void> {
    await this.checkUserAlertPermission(callingUser.id, id);

    try {
      await this.prisma.alert.update({
        where: {
          id: id,
        },
        data: {
          active: false,
          updatedBy: callingUser.id,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting alert');
    }
  }

  async createWebhookDestination(
    user: User,
    { name, url, project: projectSlug }: CreateWebhookDestinationSchema,
  ): Promise<CreateWebhookDestinationResponse> {
    await this.projectPermissions.checkUserProjectPermission(
      user.id,
      projectSlug,
    );

    try {
      return await this.prisma.webhookDestination.create({
        data: {
          name,
          url,
          projectSlug,
          secret: nanoid(),
          createdBy: user.id,
          updatedBy: user.id,
        },
        select: {
          id: true,
          name: true,
          url: true,
          projectSlug: true,
          secret: true,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed to create webhook destination');
    }
  }

  async deleteWebhookDestination(
    user: User,
    id: WebhookDestination['id'],
  ): Promise<void> {
    await this.checkUserWebhookPermission(user.id, id);

    try {
      await this.prisma.webhookDestination.update({
        where: {
          id: id,
        },
        data: {
          active: false,
          updatedBy: user.id,
          webhookDelivery: {
            updateMany: {
              where: {},
              data: { active: false, updatedBy: user.id },
            },
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting alert');
    }
  }

  async listWebhookDestinations(user: User, projectSlug: Project['slug']) {
    await this.projectPermissions.checkUserProjectPermission(
      user.id,
      projectSlug,
    );

    return await this.prisma.webhookDestination.findMany({
      where: {
        active: true,
        projectSlug,
      },
      select: {
        id: true,
        name: true,
        url: true,
        secret: true,
        projectSlug: true,
      },
    });
  }

  // Confirms the user is a member of the alert's project.
  private async checkUserAlertPermission(
    userId: User['id'],
    id: Alert['id'],
  ): Promise<void> {
    const alert = await this.prisma.alert.findUnique({
      where: {
        id,
      },
      select: {
        active: true,
        projectSlug: true,
        environmentSubId: true,
      },
    });

    if (!alert) {
      throw new VError({ info: { code: 'BAD_ALERT' } }, 'Alert not found');
    }

    if (!alert.active) {
      throw new VError({ info: { code: 'BAD_ALERT' } }, 'Alert is inactive');
    }

    const { projectSlug, environmentSubId } = alert;
    await this.projectPermissions.checkUserProjectEnvPermission(
      userId,
      projectSlug,
      environmentSubId,
    );
  }

  // Confirms the user is a member of the webhook's project.
  private async checkUserWebhookPermission(
    userId: User['id'],
    id: WebhookDestination['id'],
  ): Promise<void> {
    const webhook = await this.prisma.webhookDestination.findUnique({
      where: {
        id,
      },
      select: {
        active: true,
        projectSlug: true,
      },
    });

    if (!webhook) {
      throw new VError(
        { info: { code: 'BAD_DESTINATION' } },
        'Webhook destination not found',
      );
    }

    if (!webhook.active) {
      throw new VError(
        { info: { code: 'BAD_DESTINATION' } },
        'Webhook destination is inactive',
      );
    }

    await this.projectPermissions.checkUserProjectPermission(
      userId,
      webhook.projectSlug,
    );
  }

  // Checks user permission to create alert as well as permission for webhook destinations
  private async checkUserCreateAlertPermission(
    user: User,
    alert: CreateAlertBaseSchema,
  ) {
    // Verify the user has access to this project in order to create the alert.
    await this.projectPermissions.checkUserProjectEnvPermission(
      user.id,
      alert.projectSlug,
      alert.environmentSubId,
    );

    // Verify that the destinations belong to the same project as the alert.
    if (alert.webhookDestinations) {
      await this.checkUserWebhookDestinationsPermission(
        alert.projectSlug,
        alert.webhookDestinations,
      );
    }
  }

  // Checks that all webhooks belong to the given project.
  private async checkUserWebhookDestinationsPermission(
    projectSlug: Project['slug'],
    ids: Array<WebhookDestination['id']>,
  ) {
    const destinations = await this.prisma.webhookDestination.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        active: true,
        projectSlug: true,
      },
    });

    if (destinations.length !== ids.length) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'Failed while checking if webhook destinations exist',
      );
    }

    if (destinations.find((d) => !d.active)) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'Failed while checking if webhook destinations are active',
      );
    }

    const invalidDestinations = destinations.filter(
      (d) => d.projectSlug != projectSlug,
    );

    if (invalidDestinations.length) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'Failed while checking if webhook destinations are part of the specified project',
      );
    }
  }
}
