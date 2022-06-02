import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  User,
  Prisma,
  AlertRule,
  AcctBalRule,
  EventRule,
  FnCallRule,
  TxRule,
  AlertRuleType,
} from '@prisma/client';
import { AppConfig } from 'src/config/validate';
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
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<AppConfig>,
  ) {}

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

  private async getContractAddress(contractId: number): Promise<string> {
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

      // will throw if no team found
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

  async updateTxRule(user: User, ruleId: number, rule: UpdateTxRuleSchema) {
    await this.checkUserRulePermission(user.id, ruleId, rule.contract);
    const alertInput = await this.buildUpdateRuleInput(user, ruleId, rule);

    alertInput.txRule = {
      upsert: {
        create: {
          ...rule.txRule,
          createdBy: user.id,
          updatedBy: user.id,
        },
        update: {
          ...rule.txRule,
          updatedBy: user.id,
        },
      },
    };

    await this.updateRule(ruleId, alertInput);
  }

  async updateFnCallRule(
    user: User,
    ruleId: number,
    rule: UpdateFnCallRuleSchema,
  ) {
    await this.checkUserRulePermission(user.id, ruleId, rule.contract);
    const alertInput = await this.buildUpdateRuleInput(user, ruleId, rule);

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
          updatedBy: user.id,
        },
      },
    };

    await this.updateRule(ruleId, alertInput);
  }

  async updateEventRule(
    user: User,
    ruleId: number,
    rule: UpdateEventRuleSchema,
  ) {
    await this.checkUserRulePermission(user.id, ruleId, rule.contract);
    const alertInput = await this.buildUpdateRuleInput(user, ruleId, rule);

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
          updatedBy: user.id,
        },
      },
    };

    await this.updateRule(ruleId, alertInput);
  }

  async updateAcctBalRule(
    user: User,
    ruleId: number,
    rule: UpdateAcctBalRuleSchema,
  ) {
    await this.checkUserRulePermission(user.id, ruleId, rule.contract);
    const alertInput = await this.buildUpdateRuleInput(user, ruleId, rule);

    alertInput.acctBalRule = {
      upsert: {
        create: {
          ...rule.acctBalRule,
          createdBy: user.id,
          updatedBy: user.id,
        },
        update: {
          ...rule.acctBalRule,
          updatedBy: user.id,
        },
      },
    };

    await this.updateRule(ruleId, alertInput);
  }

  private async buildUpdateRuleInput(
    user: User,
    ruleId: number,
    rule: UpdateAlertRuleBaseSchema,
  ): Promise<Prisma.AlertRuleUpdateInput> {
    const { name, description, type, isPaused, contract } = rule;

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
    };

    // If the type was updated, then we need to delete the existing rule and create a new one under a different type.
    const currType = await this.getRuleType(ruleId);

    if (currType === type) {
      return alertInput;
    }

    const updates = {
      update: {
        active: false,
        updatedByUser: {
          connect: {
            id: user.id,
          },
        },
      },
    };

    switch (currType) {
      case 'TX_SUCCESS':
      case 'TX_FAILURE':
        alertInput.txRule = updates;
        break;
      case 'FN_CALL':
        alertInput.fnCallRule = updates;
        break;
      case 'EVENT':
        alertInput.eventRule = updates;
        break;
      case 'ACCT_BAL_PCT':
      case 'ACCT_BAL_NUM':
        alertInput.acctBalRule = updates;
        break;
      default:
        assertUnreachable(currType);
    }

    return alertInput;
  }

  private async updateRule(id: number, data: Prisma.AlertRuleUpdateInput) {
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

  async listRules(user: User, environment: number) {
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
      include: {
        fnCallRule: true,
        txRule: true,
        acctBalRule: true,
        eventRule: true,
        contract: {
          select: {
            address: true,
          },
        },
      },
    });
  }

  async deleteRule(
    callingUser: User,
    alertWhereUnique: Prisma.AlertRuleWhereUniqueInput,
  ): Promise<void> {
    // check that project is valid for deletion
    let rule;
    try {
      rule = await this.prisma.alertRule.findUnique({
        where: alertWhereUnique,
        select: {
          id: true,
          active: true,
        },
      });
      if (!rule || !rule.active) {
        throw new VError(
          { info: { code: 'BAD_ALERT' } },
          'Alert rule not found or it is already inactive',
        );
      }
    } catch (e) {
      throw new VError(
        e,
        'Failed while determining alert rule eligibility for deletion',
      );
    }

    // throw an error if the user doesn't have permission to perform this action
    await this.checkUserProjectPermission(
      callingUser.id,
      rule.environmentId,
      rule.contractId,
    );

    // soft delete the alert rule
    try {
      await this.prisma.alertRule.update({
        where: alertWhereUnique,
        data: {
          active: false,
          updatedByUser: {
            connect: {
              id: callingUser.id,
            },
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting alert rule');
    }
  }

  // Confirms the contract belongs to the environment
  // and the user is a member of the environment's project.
  private async checkUserProjectPermission(
    userId: number,
    environmentId: number,
    contractId: number,
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
    userId: number,
    ruleId: number,
    contractId: number,
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

  async getRuleType(id: number): Promise<AlertRuleType> {
    const rule = await this.prisma.alertRule.findUnique({
      where: {
        id,
      },
      select: {
        type: true,
      },
    });
    return rule.type;
  }
}
