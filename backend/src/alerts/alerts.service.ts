import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Alert,
  AcctBalRule,
  EventRule,
  FnCallRule,
  TxRule,
  RuleType,
  WebhookDestination,
} from '../../generated/alerts';
import { User, Project } from '@prisma/client';
import { customAlphabet } from 'nanoid';

import { assertUnreachable } from 'src/helpers';
import { PrismaService } from './prisma.service';
import { VError } from 'verror';
import { PermissionsService as ProjectPermissionsService } from 'src/projects/permissions.service';

type TxRuleSchema = {
  txRule: {
    contract: TxRule['contract'];
    action?: TxRule['action'];
  };
};

type FnCallRuleSchema = {
  fnCallRule: {
    contract: FnCallRule['contract'];
    function: FnCallRule['function'];
  };
};

type EventRuleSchema = {
  eventRule: {
    contract: EventRule['contract'];
    standard: EventRule['standard'];
    version: EventRule['version'];
    event: EventRule['event'];
  };
};

type AcctBalRuleSchema = {
  acctBalRule: {
    contract: AcctBalRule['contract'];
    comparator: AcctBalRule['comparator'];
    amount: AcctBalRule['amount'];
  };
};

type CreateAlertBaseSchema = {
  name?: Alert['name'];
  type: Alert['type'];
  projectSlug: Alert['projectSlug'];
  environmentSubId: Alert['environmentSubId'];
  net: Alert['net'];
  webhookDestinations?: Array<WebhookDestination['id']>;
};
type CreateTxAlertSchema = CreateAlertBaseSchema & TxRuleSchema;
type CreateFnCallAlertSchema = CreateAlertBaseSchema & FnCallRuleSchema;
type CreateEventAlertSchema = CreateAlertBaseSchema & EventRuleSchema;
type CreateAcctBalAlertSchema = CreateAlertBaseSchema & AcctBalRuleSchema;

type CreateAlertResponse = { name: Alert['name']; id: Alert['id'] };

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

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private projectPermissions: ProjectPermissionsService,
  ) {}

  async createTxSuccessAlert(
    user: User,
    alert: CreateTxAlertSchema,
  ): Promise<CreateAlertResponse> {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.txRule.contract;
    const alertInput = this.buildCreateAlertInput(user, {
      ...alert,
      name: alert.name || `Successful transaction in ${address}`,
    });

    alertInput.txRule = {
      create: {
        ...alert.txRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createAlert(alertInput);
  }

  async createTxFailureAlert(
    user: User,
    alert: CreateTxAlertSchema,
  ): Promise<CreateAlertResponse> {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.txRule.contract;
    const alertInput = this.buildCreateAlertInput(user, {
      ...alert,
      name: alert.name || `Failed transaction in ${address}`,
    });

    alertInput.txRule = {
      create: {
        ...alert.txRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createAlert(alertInput);
  }

  async createFnCallAlert(
    user: User,
    alert: CreateFnCallAlertSchema,
  ): Promise<CreateAlertResponse> {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.fnCallRule.contract;
    const alertInput = this.buildCreateAlertInput(user, {
      ...alert,
      name:
        alert.name ||
        `Function ${alert.fnCallRule.function} called in ${address}`,
    });

    alertInput.fnCallRule = {
      create: {
        params: {}, // TODO remove this when it can be set from the client
        ...alert.fnCallRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createAlert(alertInput);
  }

  async createEventAlert(
    user: User,
    alert: CreateEventAlertSchema,
  ): Promise<CreateAlertResponse> {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.eventRule.contract;
    const alertInput = this.buildCreateAlertInput(user, {
      ...alert,
      name: alert.name || `Event ${alert.eventRule.event} logged in ${address}`,
    });

    alertInput.eventRule = {
      create: {
        data: {}, // TODO remove this when it can be set from the client
        ...alert.eventRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createAlert(alertInput);
  }

  async createAcctBalAlert(
    user: User,
    alert: CreateAcctBalAlertSchema,
  ): Promise<CreateAlertResponse> {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.acctBalRule.contract;
    const alertInput = this.buildCreateAlertInput(user, {
      ...alert,
      name: alert.name || `Account balance changed in ${address}`,
    });

    alertInput.acctBalRule = {
      create: {
        ...alert.acctBalRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createAlert(alertInput);
  }

  private buildCreateAlertInput(
    user: User,
    alert: CreateAlertBaseSchema,
  ): Prisma.AlertCreateInput {
    const {
      name,
      type,
      projectSlug,
      environmentSubId,
      net,
      webhookDestinations,
    } = alert;

    const alertInput: Prisma.AlertCreateInput = {
      name,
      type,
      projectSlug,
      environmentSubId,
      net,
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

  private async createAlert(
    data: Prisma.AlertCreateInput,
  ): Promise<CreateAlertResponse> {
    let alert;

    try {
      alert = await this.prisma.alert.create({
        data,
      });
    } catch (e) {
      throw new VError(e, 'Failed while executing alert creation query');
    }

    return {
      name: alert.name,
      id: alert.id,
    };
  }

  async updateAlert(
    callingUser: User,
    id: Alert['id'],
    name: Alert['name'],
    isPaused: Alert['isPaused'],
  ) {
    await this.checkUserAlertPermission(callingUser.id, id);

    try {
      await this.prisma.alert.update({
        where: {
          id,
        },
        data: {
          name,
          isPaused,
          updatedBy: callingUser.id,
        },
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

    const alert = await this.fetchAlert(id);

    const deleteRuleInput = await this.buildDeleteRuleInput(
      callingUser.id,
      alert.type,
    );
    // soft delete the alert and rule
    try {
      await this.prisma.alert.update({
        where: {
          id: id,
        },
        data: {
          active: false,
          updatedBy: callingUser.id,
          ...deleteRuleInput,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting alert rule');
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

  private async buildDeleteRuleInput(
    userId: User['id'],
    type: RuleType,
  ): Promise<
    | { txRule: Prisma.TxRuleUpdateOneWithoutAlertInput }
    | { fnCallRule: Prisma.FnCallRuleUpdateOneWithoutAlertInput }
    | { eventRule: Prisma.EventRuleUpdateOneWithoutAlertInput }
    | { acctBalRule: Prisma.AcctBalRuleUpdateOneWithoutAlertInput }
  > {
    const updates = {
      update: {
        active: false,
        updatedBy: userId,
      },
    };

    switch (type) {
      case 'TX_SUCCESS':
      case 'TX_FAILURE':
        return { txRule: updates };
      case 'FN_CALL':
        return { fnCallRule: updates };
      case 'EVENT':
        return { eventRule: updates };
      case 'ACCT_BAL_PCT':
      case 'ACCT_BAL_NUM':
        return { acctBalRule: updates };
      default:
        assertUnreachable(type);
    }
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

  private async fetchAlert(id: Alert['id']): Promise<Alert> {
    try {
      const alert = await this.prisma.alert.findUnique({
        where: {
          id,
        },
      });

      if (!alert) {
        throw new VError({ info: { code: 'BAD_ALERT' } }, 'Alert not found');
      }

      if (!alert.active) {
        throw new VError({ info: { code: 'BAD_ALERT' } }, 'Alert is inactive');
      }

      return alert;
    } catch (e) {
      throw new VError(e, 'Failed while getting alert rule type');
    }
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
      type: true,
      name: true,
      isPaused: true,
      fnCallRule: {
        select: {
          id: true,
          contract: true,
          function: true,
          params: true,
        },
      },
      txRule: {
        select: {
          id: true,
          contract: true,
          action: true,
        },
      },
      acctBalRule: {
        select: {
          id: true,
          contract: true,
          comparator: true,
          amount: true,
        },
      },
      eventRule: {
        select: {
          id: true,
          contract: true,
          standard: true,
          version: true,
          event: true,
          data: true,
        },
      },
      webhookDeliveries: {
        select: {
          id: true,
          webhookDestination: {
            select: {
              id: true,
              name: true,
              url: true,
            },
          },
        },
      },
    };
  }
}
