import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Alert,
  WebhookDestination,
  AlertRuleKind,
  Destination,
} from '../../generated/prisma/alerts';

// TODO should we re-export these types from the core module? So there is no dependency on the core prisma/client
// yes
import { User, Project } from '@prisma/client';
import { PermissionsService as ProjectPermissionsService } from 'src/projects/permissions.service';

import { customAlphabet } from 'nanoid';

import { PrismaService } from './prisma.service';
import { VError } from 'verror';
import { NumberComparator, RuleType, Net } from './types';

type TxRuleSchema = {
  txRule: {
    contract: string;
  };
};

type FnCallRuleSchema = {
  fnCallRule: {
    contract: string;
    function: string;
  };
};

type EventRuleSchema = {
  eventRule: {
    contract: string;
    standard: string;
    version: string;
    event: string;
  };
};

type AcctBalRuleSchema = {
  acctBalRule: {
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
  destinations?: Array<Destination['id']>;
};
type CreateTxAlertSchema = CreateAlertBaseSchema & TxRuleSchema;
type CreateFnCallAlertSchema = CreateAlertBaseSchema & FnCallRuleSchema;
type CreateEventAlertSchema = CreateAlertBaseSchema & EventRuleSchema;
type CreateAcctBalAlertSchema = CreateAlertBaseSchema & AcctBalRuleSchema;

type CreateWebhookDestinationSchema = {
  name?: Destination['name'];
  project: Destination['projectSlug'];
  url: WebhookDestination['url'];
};

type CreateWebhookDestinationResponse = {
  id: WebhookDestination['id'];
  name?: Destination['name'];
  projectSlug: Destination['projectSlug'];
  url: WebhookDestination['url'];
  secret: WebhookDestination['secret'];
};

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12,
);

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private projectPermissions: ProjectPermissionsService,
  ) {}

  async createTxSuccessAlert(user: User, alert: CreateTxAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.txRule.contract;
    const rule = {
      rule: 'ACTION_ANY',
      affected_account_id: address,
      status: 'SUCCESS',
    };
    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name: alert.name || `Successful transaction in ${address}`,
      },
      AlertRuleKind.ACTIONS,
      rule,
    );

    return this.createAlert(alertInput);
  }

  async createTxFailureAlert(user: User, alert: CreateTxAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.txRule.contract;
    const rule = {
      rule: 'ACTION_ANY',
      affected_account_id: address,
      status: 'FAIL',
    };

    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name: alert.name || `Failed transaction in ${address}`,
      },
      AlertRuleKind.ACTIONS,
      rule,
    );

    return this.createAlert(alertInput);
  }

  async createFnCallAlert(user: User, alert: CreateFnCallAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.fnCallRule.contract;
    const rule = {
      rule: 'ACTION_FUNCTION_CALL', // TODO rule structure is not clearly defined and may change
      affected_account_id: address,
      status: 'ANY',
      function: alert.fnCallRule.function,
    };

    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name:
          alert.name ||
          `Function ${alert.fnCallRule.function} called in ${address}`,
      },
      AlertRuleKind.ACTIONS,
      rule,
    );

    return this.createAlert(alertInput);
  }

  async createEventAlert(user: User, alert: CreateEventAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.eventRule.contract;
    const rule = {
      rule: 'EVENT_ANY', // TODO rule structure is not clearly defined and may change
      affected_account_id: address,
      status: 'ANY',
      event: alert.eventRule.event,
      standard: alert.eventRule.standard,
      version: alert.eventRule.version,
    };

    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name:
          alert.name || `Event ${alert.eventRule.event} logged in ${address}`,
      },
      AlertRuleKind.EVENTS,
      rule,
    );

    return this.createAlert(alertInput);
  }

  async createAcctBalAlert(user: User, alert: CreateAcctBalAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.acctBalRule.contract;
    const rule = {
      rule: 'STATE_CHANGE_ACCOUNT_BALANCE', // TODO rule structure is not clearly defined and may change
      affected_account_id: address,
      status: 'ANY',
      amount: alert.acctBalRule.amount,
      comparator: alert.acctBalRule.comparator,
      percentage: alert.type === 'ACCT_BAL_PCT',
    };

    const alertInput = this.buildCreateAlertInput(
      user,
      {
        ...alert,
        name: alert.name || `Account balance changed in ${address}`,
      },
      AlertRuleKind.STATE_CHANGES,
      rule,
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
      destinations,
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
      enabledDestinations: {
        createMany: {
          data: destinations
            ? destinations.map((el) => ({
                destinationId: el,
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
      return await this.prisma.alert.create({
        data,
        select: this.buildSelectAlert(),
      });
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
      return await this.prisma.alert.update({
        where: {
          id,
        },
        data: {
          name,
          isPaused,
          updatedBy: callingUser.id,
        },
        select: this.buildSelectAlert(),
      });
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

    return await this.prisma.alert.findMany({
      where: {
        active: true,
        projectSlug,
        environmentSubId,
      },
      select: {
        ...this.buildSelectAlert(),
      },
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
      const c = await this.prisma.destination.create({
        data: {
          name,
          projectSlug,
          type: 'WEBHOOK',
          createdBy: user.id,
          updatedBy: user.id,
          webhookDestination: {
            create: {
              secret: nanoid(),
              createdBy: user.id,
              updatedBy: user.id,
              url,
            },
          },
        },
        select: {
          id: true,
          name: true,
          projectSlug: true,
          webhookDestination: {
            select: {
              url: true,
              secret: true,
            },
          },
        },
      });

      return {
        id: c.id,
        name: c.name,
        projectSlug: c.projectSlug,
        url: c.webhookDestination.url,
        secret: c.webhookDestination.secret,
      };
    } catch (e) {
      throw new VError(e, 'Failed to create webhook destination');
    }
  }

  async deleteDestination(user: User, id: Destination['id']): Promise<void> {
    await this.checkUserDestinationPermission(user.id, id);

    try {
      await this.prisma.destination.update({
        where: {
          id: id,
        },
        data: {
          active: false,
          updatedBy: user.id,
          EnabledDestination: {
            deleteMany: {},
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting alert');
    }
  }

  async listDestinations(user: User, projectSlug: Project['slug']) {
    await this.projectPermissions.checkUserProjectPermission(
      user.id,
      projectSlug,
    );

    return await this.prisma.destination.findMany({
      where: {
        active: true,
        projectSlug,
      },
      select: {
        id: true,
        name: true,
        projectSlug: true,
        type: true,
        webhookDestination: {
          select: {
            url: true,
            secret: true,
          },
        },
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
  private async checkUserDestinationPermission(
    userId: User['id'],
    id: Destination['id'],
  ): Promise<void> {
    const destination = await this.prisma.destination.findUnique({
      where: {
        id,
      },
      select: {
        active: true,
        projectSlug: true,
      },
    });

    if (!destination) {
      throw new VError(
        { info: { code: 'BAD_DESTINATION' } },
        'Destination not found',
      );
    }

    if (!destination.active) {
      throw new VError(
        { info: { code: 'BAD_DESTINATION' } },
        'Destination is inactive',
      );
    }

    await this.projectPermissions.checkUserProjectPermission(
      userId,
      destination.projectSlug,
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
    if (alert.destinations) {
      await this.checkAlertDestinationCompatibility(
        alert.projectSlug,
        alert.destinations,
      );
    }
  }

  // Checks that the destination belongs to the same project as the alert
  private async checkAlertDestinationCompatibility(
    projectSlug: Project['slug'],
    ids: Array<Destination['id']>,
  ) {
    const destinations = await this.prisma.destination.findMany({
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
        'Failed to find destinations while checking alert compatibility',
      );
    }

    if (destinations.find((d) => !d.active)) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'Destination inactive while checking alert compatibility',
      );
    }

    const invalidDestinations = destinations.filter(
      (d) => d.projectSlug != projectSlug,
    );

    if (invalidDestinations.length) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'Found destination not compatible with alert',
      );
    }
  }

  async getAlertDetails(callingUser: User, id: Alert['id']) {
    try {
      await this.checkUserAlertPermission(callingUser.id, id);

      const alert = await this.prisma.alert.findUnique({
        where: {
          id,
        },
        select: {
          ...this.buildSelectAlert(),
        },
      });

      return alert;
    } catch (e) {
      throw new VError(e, 'Failed to get alert rule details');
    }
  }

  private buildSelectAlert(): Prisma.AlertSelect {
    return {
      id: true,
      alertRuleKind: true,
      name: true,
      isPaused: true,
      projectSlug: true,
      environmentSubId: true,
      chainId: true,
      enabledDestinations: {
        select: {
          destination: {
            select: {
              id: true,
              name: true,
              webhookDestination: {
                select: {
                  url: true,
                },
              },
            },
          },
        },
      },
    };
  }
}
