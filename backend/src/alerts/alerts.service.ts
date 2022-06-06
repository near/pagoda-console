import { Injectable } from '@nestjs/common';
import {
  User,
  Prisma,
  Alert,
  AcctBalRule,
  EventRule,
  FnCallRule,
  TxRule,
  RuleType,
  Contract,
  Environment,
} from '@prisma/client';
import { assertUnreachable } from 'src/helpers';
import { PrismaService } from 'src/prisma.service';
import { VError } from 'verror';

type TxRuleSchema = {
  txRule: { action?: TxRule['action'] };
};

type FnCallRuleSchema = {
  fnCallRule: {
    function: FnCallRule['function'];
  };
};

type EventRuleSchema = {
  eventRule: {
    standard: EventRule['standard'];
    version: EventRule['version'];
    event: EventRule['event'];
  };
};

type AcctBalRuleSchema = {
  acctBalRule: {
    comparator: AcctBalRule['comparator'];
    amount: AcctBalRule['amount'];
  };
};

type CreateAlertBaseSchema = {
  name?: Alert['name'];
  type: Alert['type'];
  environment: Alert['environmentId'];
  contract: Alert['contractId'];
};
type CreateTxAlertSchema = CreateAlertBaseSchema & TxRuleSchema;
type CreateFnCallAlertSchema = CreateAlertBaseSchema & FnCallRuleSchema;
type CreateEventAlertSchema = CreateAlertBaseSchema & EventRuleSchema;
type CreateAcctBalAlertSchema = CreateAlertBaseSchema & AcctBalRuleSchema;

type CreateAlertResponse = { name: Alert['name']; id: Alert['id'] };

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async createTxSuccessAlert(
    user: User,
    alert: CreateTxAlertSchema,
  ): Promise<CreateAlertResponse> {
    await this.checkUserProjectPermission(
      user.id,
      alert.environment,
      alert.contract,
    );
    const address = await this.getContractAddress(alert.contract);

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
    await this.checkUserProjectPermission(
      user.id,
      alert.environment,
      alert.contract,
    );
    const address = await this.getContractAddress(alert.contract);

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
    await this.checkUserProjectPermission(
      user.id,
      alert.environment,
      alert.contract,
    );
    const address = await this.getContractAddress(alert.contract);

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
    await this.checkUserProjectPermission(
      user.id,
      alert.environment,
      alert.contract,
    );
    const address = await this.getContractAddress(alert.contract);

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
    await this.checkUserProjectPermission(
      user.id,
      alert.environment,
      alert.contract,
    );
    const address = await this.getContractAddress(alert.contract);

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

  private async getContractAddress(
    contractId: Contract['id'],
  ): Promise<string> {
    let address;
    try {
      const contractFind = await this.prisma.contract.findFirst({
        where: {
          id: contractId,
          active: true,
        },
        select: {
          address: true,
        },
      });

      if (!contractFind) {
        throw new VError('Query to find contract came back empty');
      }
      address = contractFind.address;
    } catch (e) {
      throw new VError(e, 'Failed to find contract');
    }
    return address;
  }

  private buildCreateAlertInput(
    user: User,
    alert: CreateAlertBaseSchema,
  ): Prisma.AlertCreateInput {
    const { name, type, environment, contract } = alert;

    const alertInput: Prisma.AlertCreateInput = {
      name,
      type,
      contract: {
        connect: {
          id: contract,
        },
      },
      environment: {
        connect: {
          id: environment,
        },
      },
      createdByUser: {
        connect: {
          id: user.id,
        },
      },
      updatedByUser: {
        connect: {
          id: user.id,
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
          updatedByUser: {
            connect: {
              id: callingUser.id,
            },
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while executing alert update query');
    }
  }

  async listAlerts(user: User, environment: Environment['id']) {
    return await this.prisma.alert.findMany({
      where: {
        active: true,
        environment: {
          active: true,
          id: environment,
          project: {
            active: true,
            teamProjects: {
              some: {
                active: true,
                team: {
                  active: true,
                  teamMembers: {
                    some: {
                      active: true,
                      userId: user.id,
                    },
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        type: true,
        name: true,
        isPaused: true,
        fnCallRule: {
          select: {
            id: true,
            function: true,
            params: true,
          },
        },
        txRule: {
          select: {
            id: true,
            action: true,
          },
        },
        acctBalRule: {
          select: {
            id: true,
            comparator: true,
            amount: true,
          },
        },
        eventRule: {
          select: {
            id: true,
            standard: true,
            version: true,
            event: true,
            data: true,
          },
        },
        contract: {
          select: {
            address: true,
          },
        },
      },
    });
  }

  async deleteAlert(callingUser: User, id: Alert['id']): Promise<void> {
    const alert = await this.fetchAlert(id);

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserAlertPermission(callingUser.id, id, alert.contractId);

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
          updatedByUser: {
            connect: {
              id: callingUser.id,
            },
          },
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
        updatedByUser: {
          connect: {
            id: userId,
          },
        },
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

  // Confirms the contract belongs to the environment
  // and the user is a member of the environment's project.
  private async checkUserProjectPermission(
    userId: User['id'],
    environmentId: Environment['id'],
    contractId: Contract['id'],
  ): Promise<void> {
    const res = await this.prisma.teamMember.findFirst({
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
                environments: {
                  some: {
                    id: environmentId,
                    contracts: {
                      some: {
                        id: contractId,
                      },
                    },
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
        'User does not have rights to manage these alerts',
      );
    }
  }

  // Confirms the contract, if provided, belongs to the same environment that the rule is in
  // and the user is a member of the rule's project.
  private async checkUserAlertPermission(
    userId: User['id'],
    id: Alert['id'],
    contractId?: Contract['id'],
  ): Promise<void> {
    let contractQuery;
    if (contractId) {
      contractQuery = {
        contracts: {
          some: {
            id: contractId,
          },
        },
      };
    }

    const res = await this.prisma.teamMember.findFirst({
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
                environments: {
                  some: {
                    ...contractQuery,
                    alerts: {
                      some: {
                        id,
                      },
                    },
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
        'User does not have rights to manage these alerts',
      );
    }
  }

  private async fetchAlert(id: Alert['id']): Promise<Alert> {
    try {
      const rule = await this.prisma.alert.findUnique({
        where: {
          id,
        },
      });

      if (!rule) {
        throw new VError({ info: { code: 'BAD_ALERT' } }, 'Alert not found');
      }

      if (!rule.active) {
        throw new VError({ info: { code: 'BAD_ALERT' } }, 'Alert is inactive');
      }

      return rule;
    } catch (e) {
      throw new VError(e, 'Failed while getting alert rule type');
    }
  }

  async getRuleDetails(callingUser: User, ruleId: Alert['id']): Promise<any> {
    try {
      await this.checkUserAlertPermission(callingUser.id, ruleId);

      const alert = await this.prisma.alert.findUnique({
        where: {
          id: ruleId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          contract: {
            select: {
              id: true,
              address: true,
            },
          },
          txRule: true,
          isPaused: true,
        },
      });

      return alert;
    } catch (e) {
      throw new VError(e, 'Failed to get alert rule details');
    }
  }
}
