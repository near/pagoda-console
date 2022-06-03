import { Injectable } from '@nestjs/common';
import {
  User,
  Prisma,
  AlertRule,
  AcctBalRule,
  EventRule,
  FnCallRule,
  TxRule,
  AlertRuleType,
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

type CreateAlertRuleBaseSchema = {
  name?: AlertRule['name'];
  type: AlertRule['type'];
  environment: AlertRule['environmentId'];
  contract: AlertRule['contractId'];
};
type CreateTxRuleSchema = CreateAlertRuleBaseSchema & TxRuleSchema;
type CreateFnCallRuleSchema = CreateAlertRuleBaseSchema & FnCallRuleSchema;
type CreateEventRuleSchema = CreateAlertRuleBaseSchema & EventRuleSchema;
type CreateAcctBalRuleSchema = CreateAlertRuleBaseSchema & AcctBalRuleSchema;

type CreateAlertRuleResponse = { name: AlertRule['name']; id: AlertRule['id'] };

type UpdateAlertRuleBaseSchema = {
  name: AlertRule['name'];
  description: AlertRule['description'];
  type: AlertRule['type'];
  isPaused: AlertRule['isPaused'];
  contract: AlertRule['contractId'];
};
type UpdateTxRuleSchema = UpdateAlertRuleBaseSchema & TxRuleSchema;
type UpdateFnCallRuleSchema = UpdateAlertRuleBaseSchema & FnCallRuleSchema;
type UpdateEventRuleSchema = UpdateAlertRuleBaseSchema & EventRuleSchema;
type UpdateAcctBalRuleSchema = UpdateAlertRuleBaseSchema & AcctBalRuleSchema;

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async createTxSuccessRule(
    user: User,
    rule: CreateTxRuleSchema,
  ): Promise<CreateAlertRuleResponse> {
    await this.checkUserProjectPermission(
      user.id,
      rule.environment,
      rule.contract,
    );
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildCreateRuleInput(user, {
      ...rule,
      name: rule.name || `Successful transaction in ${address}`,
    });

    alertInput.txRule = {
      create: {
        ...rule.txRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createRule(alertInput);
  }

  async createTxFailureRule(
    user: User,
    rule: CreateTxRuleSchema,
  ): Promise<CreateAlertRuleResponse> {
    await this.checkUserProjectPermission(
      user.id,
      rule.environment,
      rule.contract,
    );
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildCreateRuleInput(user, {
      ...rule,
      name: rule.name || `Failed transaction in ${address}`,
    });

    alertInput.txRule = {
      create: {
        ...rule.txRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createRule(alertInput);
  }

  async createFnCallRule(
    user: User,
    rule: CreateFnCallRuleSchema,
  ): Promise<CreateAlertRuleResponse> {
    await this.checkUserProjectPermission(
      user.id,
      rule.environment,
      rule.contract,
    );
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildCreateRuleInput(user, {
      ...rule,
      name:
        rule.name ||
        `Function ${rule.fnCallRule.function} called in ${address}`,
    });

    alertInput.fnCallRule = {
      create: {
        params: {}, // TODO remove this when it can be set from the client
        ...rule.fnCallRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createRule(alertInput);
  }

  async createEventRule(
    user: User,
    rule: CreateEventRuleSchema,
  ): Promise<CreateAlertRuleResponse> {
    await this.checkUserProjectPermission(
      user.id,
      rule.environment,
      rule.contract,
    );
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildCreateRuleInput(user, {
      ...rule,
      name: rule.name || `Event ${rule.eventRule.event} logged in ${address}`,
    });

    alertInput.eventRule = {
      create: {
        data: {}, // TODO remove this when it can be set from the client
        ...rule.eventRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createRule(alertInput);
  }

  async createAcctBalRule(
    user: User,
    rule: CreateAcctBalRuleSchema,
  ): Promise<CreateAlertRuleResponse> {
    await this.checkUserProjectPermission(
      user.id,
      rule.environment,
      rule.contract,
    );
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildCreateRuleInput(user, {
      ...rule,
      name: rule.name || `Account balance changed in ${address}`,
    });

    alertInput.acctBalRule = {
      create: {
        ...rule.acctBalRule,
        createdBy: user.id,
        updatedBy: user.id,
      },
    };

    return this.createRule(alertInput);
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

  private buildCreateRuleInput(
    user: User,
    rule: CreateAlertRuleBaseSchema,
  ): Prisma.AlertRuleCreateInput {
    const { name, type, environment, contract } = rule;

    const alertInput: Prisma.AlertRuleCreateInput = {
      name,
      description: '',
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

  private async createRule(
    data: Prisma.AlertRuleCreateInput,
  ): Promise<CreateAlertRuleResponse> {
    let alert;

    try {
      alert = await this.prisma.alertRule.create({
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

  async updateTxRule(
    user: User,
    ruleId: AlertRule['id'],
    rule: UpdateTxRuleSchema,
  ) {
    const currType = (await this.fetchRule(ruleId)).type;
    await this.checkUserRulePermission(user.id, ruleId, rule.contract);
    const alertInput = await this.buildUpdateRuleInput(user, rule, currType);

    alertInput.txRule = {
      upsert: {
        create: {
          ...rule.txRule,
          createdBy: user.id,
          updatedBy: user.id,
        },
        update: {
          ...rule.txRule,
          active: true, // Important, because the rule might be pre-existing but soft-deleted.
          updatedBy: user.id,
        },
      },
    };

    await this.updateRule(ruleId, alertInput);
  }

  async updateFnCallRule(
    user: User,
    ruleId: AlertRule['id'],
    rule: UpdateFnCallRuleSchema,
  ) {
    const currType = (await this.fetchRule(ruleId)).type;
    await this.checkUserRulePermission(user.id, ruleId, rule.contract);
    const alertInput = await this.buildUpdateRuleInput(user, rule, currType);

    alertInput.fnCallRule = {
      upsert: {
        create: {
          params: {}, // TODO remove this when it can be set from the client
          ...rule.fnCallRule,
          createdBy: user.id,
          updatedBy: user.id,
        },
        update: {
          params: {}, // TODO remove this when it can be set from the client
          ...rule.fnCallRule,
          active: true, // Important, because the rule might be pre-existing but soft-deleted.
          updatedBy: user.id,
        },
      },
    };

    await this.updateRule(ruleId, alertInput);
  }

  async updateEventRule(
    user: User,
    ruleId: AlertRule['id'],
    rule: UpdateEventRuleSchema,
  ) {
    const currType = (await this.fetchRule(ruleId)).type;
    await this.checkUserRulePermission(user.id, ruleId, rule.contract);
    const alertInput = await this.buildUpdateRuleInput(user, rule, currType);

    alertInput.eventRule = {
      upsert: {
        create: {
          data: {}, // TODO remove this when it can be set from the client
          ...rule.eventRule,
          createdBy: user.id,
          updatedBy: user.id,
        },
        update: {
          data: {}, // TODO remove this when it can be set from the client
          ...rule.eventRule,
          active: true, // Important, because the rule might be pre-existing but soft-deleted.
          updatedBy: user.id,
        },
      },
    };

    await this.updateRule(ruleId, alertInput);
  }

  async updateAcctBalRule(
    user: User,
    ruleId: AlertRule['id'],
    rule: UpdateAcctBalRuleSchema,
  ) {
    const currType = (await this.fetchRule(ruleId)).type;
    await this.checkUserRulePermission(user.id, ruleId, rule.contract);
    const alertInput = await this.buildUpdateRuleInput(user, rule, currType);

    alertInput.acctBalRule = {
      upsert: {
        create: {
          ...rule.acctBalRule,
          createdBy: user.id,
          updatedBy: user.id,
        },
        update: {
          ...rule.acctBalRule,
          active: true, // Important, because the rule might be pre-existing but soft-deleted.
          updatedBy: user.id,
        },
      },
    };

    await this.updateRule(ruleId, alertInput);
  }

  private async buildUpdateRuleInput(
    user: User,
    rule: UpdateAlertRuleBaseSchema,
    currentRuleType: AlertRuleType,
  ): Promise<Prisma.AlertRuleUpdateInput> {
    const { name, description, type, isPaused, contract } = rule;

    // If the type was updated, then we need to delete the existing rule and upsert a new one under a different type.
    let deleteRuleInput;
    if (currentRuleType !== type) {
      deleteRuleInput = await this.buildDeleteSubRuleInput(
        user.id,
        currentRuleType,
      );
    }

    const alertInput: Prisma.AlertRuleUpdateInput = {
      name,
      description,
      type,
      isPaused,
      contract: {
        connect: {
          id: contract,
        },
      },
      updatedByUser: {
        connect: {
          id: user.id,
        },
      },
      ...deleteRuleInput,
    };

    return alertInput;
  }

  private async updateRule(
    id: AlertRule['id'],
    data: Prisma.AlertRuleUpdateInput,
  ) {
    try {
      await this.prisma.alertRule.update({
        where: {
          id,
        },
        data,
      });
    } catch (e) {
      throw new VError(e, 'Failed while executing alert update query');
    }
  }

  async listRules(user: User, environment: Environment['id']) {
    return await this.prisma.alertRule.findMany({
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
        description: true,
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

  async deleteRule(callingUser: User, ruleId: AlertRule['id']): Promise<void> {
    const rule = await this.fetchRule(ruleId);

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserRulePermission(callingUser.id, ruleId, rule.contractId);

    const deleteSubRuleInput = await this.buildDeleteSubRuleInput(
      callingUser.id,
      rule.type,
    );
    // soft delete the alert rule
    try {
      await this.prisma.alertRule.update({
        where: {
          id: ruleId,
        },
        data: {
          active: false,
          updatedByUser: {
            connect: {
              id: callingUser.id,
            },
          },
          ...deleteSubRuleInput,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting alert rule');
    }
  }

  private async buildDeleteSubRuleInput(
    userId: User['id'],
    type: AlertRuleType,
  ): Promise<
    | { txRule: Prisma.TxRuleUpdateOneWithoutAlertRuleInput }
    | { fnCallRule: Prisma.FnCallRuleUpdateOneWithoutAlertRuleInput }
    | { eventRule: Prisma.EventRuleUpdateOneWithoutAlertRuleInput }
    | { acctBalRule: Prisma.AcctBalRuleUpdateOneWithoutAlertRuleInput }
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

  // Confirms the contract belongs to the same environment that the rule is in
  // and the user is a member of the rule's project.
  private async checkUserRulePermission(
    userId: User['id'],
    ruleId: AlertRule['id'],
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
                    contracts: {
                      some: {
                        id: contractId,
                      },
                    },
                    alertRules: {
                      some: {
                        id: ruleId,
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

  private async fetchRule(id: AlertRule['id']): Promise<AlertRule> {
    try {
      const rule = await this.prisma.alertRule.findUnique({
        where: {
          id,
        },
      });

      if (!rule) {
        throw new VError(
          { info: { code: 'BAD_ALERT' } },
          'Alert rule not found',
        );
      }

      if (!rule.active) {
        throw new VError(
          { info: { code: 'BAD_ALERT' } },
          'Alert rule is inactive',
        );
      }

      return rule;
    } catch (e) {
      throw new VError(e, 'Failed while getting alert rule type');
    }
  }
}
