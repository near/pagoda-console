import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Alert,
  AcctBalRule,
  EventRule,
  FnCallRule,
  TxRule,
  RuleType,
} from '../../modules/alerts/prisma/generated';
import { User, Environment, Project } from '@prisma/client';

import { assertUnreachable } from 'src/helpers';
import { PrismaService } from './prisma.service';
import { PrismaService as PrismaConsoleService } from 'src/prisma.service';
import { VError } from 'verror';

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
};
type CreateTxAlertSchema = CreateAlertBaseSchema & TxRuleSchema;
type CreateFnCallAlertSchema = CreateAlertBaseSchema & FnCallRuleSchema;
type CreateEventAlertSchema = CreateAlertBaseSchema & EventRuleSchema;
type CreateAcctBalAlertSchema = CreateAlertBaseSchema & AcctBalRuleSchema;

type CreateAlertResponse = { name: Alert['name']; id: Alert['id'] };

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private prismaConsole: PrismaConsoleService,
  ) {}

  async createTxSuccessAlert(
    user: User,
    alert: CreateTxAlertSchema,
  ): Promise<CreateAlertResponse> {
    await this.checkUserProjectEnvPermission(
      user.id,
      alert.projectSlug,
      alert.environmentSubId,
    );

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
    await this.checkUserProjectEnvPermission(
      user.id,
      alert.projectSlug,
      alert.environmentSubId,
    );

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
    await this.checkUserProjectEnvPermission(
      user.id,
      alert.projectSlug,
      alert.environmentSubId,
    );

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
    await this.checkUserProjectEnvPermission(
      user.id,
      alert.projectSlug,
      alert.environmentSubId,
    );

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
    await this.checkUserProjectEnvPermission(
      user.id,
      alert.projectSlug,
      alert.environmentSubId,
    );

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
    const { name, type, projectSlug, environmentSubId, net } = alert;

    const alertInput: Prisma.AlertCreateInput = {
      name,
      type,
      projectSlug,
      environmentSubId,
      net,
      createdBy: user.id,
      updatedBy: user.id,
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
    await this.checkUserProjectEnvPermission(
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
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'Failed to determine that alert exists',
      );
    }

    if (!alert.active) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'Alert is inactive',
      );
    }

    const { projectSlug, environmentSubId } = alert;
    await this.checkUserProjectEnvPermission(
      userId,
      projectSlug,
      environmentSubId,
    );
  }

  // TODO move to devconsole core
  private async checkUserProjectEnvPermission(
    userId: User['id'],
    slug: Project['slug'],
    subId: Environment['subId'],
  ) {
    const res = await this.prismaConsole.teamMember.findFirst({
      where: {
        userId,
        active: true,
        team: {
          active: true,
          teamProjects: {
            some: {
              active: true,
              project: {
                active: true,
                slug,
                environments: {
                  some: {
                    active: true,
                    subId,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!res) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'User does not have rights to manage this project and environment',
      );
    }
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

  async getAlertDetails(callingUser: User, id: Alert['id']) {
    try {
      await this.checkUserAlertPermission(callingUser.id, id);

      const alert = await this.prisma.alert.findUnique({
        where: {
          id,
        },
        select: {
          ...this.buildSelectAlert(),
          active: true,
        },
      });

      const { active, ...alertWithoutActiveProp } = alert;

      if (!active) {
        throw new VError({ info: { code: 'BAD_ALERT' } }, 'Alert is inactive');
      }

      return alertWithoutActiveProp;
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
    };
  }
}
