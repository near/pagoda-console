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
} from '@prisma/client';
import { AppConfig } from 'src/config/validate';
import { PrismaService } from 'src/prisma.service';
import { VError } from 'verror';

type AlertRuleBaseSchema = {
  name?: AlertRule['name'];
  type: AlertRule['type'];
  environment: AlertRule['environmentId'];
  contract: AlertRule['contractId'];
};
type FnCallRuleSchema = AlertRuleBaseSchema & {
  fnCallRule: {
    function: FnCallRule['function'];
  };
};
type TxRuleSchema = AlertRuleBaseSchema & {
  txRule: { action?: TxRule['action'] };
};
type EventRuleSchema = AlertRuleBaseSchema & {
  eventRule: {
    standard: EventRule['standard'];
    version: EventRule['version'];
    event: EventRule['event'];
  };
};
type AcctBalRuleSchema = AlertRuleBaseSchema & {
  acctBalRule: {
    comparator: AcctBalRule['comparator'];
    amount: AcctBalRule['amount'];
  };
};

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<AppConfig>,
  ) {}

  async createTxSuccessRule(
    user: User,
    rule: TxRuleSchema,
  ): Promise<{ name: AlertRule['name']; id: AlertRule['id'] }> {
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildRuleInput(user, {
      ...rule,
      name: rule.name || `Successful transaction in ${address}`,
    });

    alertInput.txRule = {
      create: {
        ...rule.txRule,
      },
    };

    return this.createRule(alertInput);
  }

  async createTxFailureRule(
    user: User,
    rule: TxRuleSchema,
  ): Promise<{ name: AlertRule['name']; id: AlertRule['id'] }> {
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildRuleInput(user, {
      ...rule,
      name: rule.name || `Failed transaction in ${address}`,
    });

    alertInput.txRule = {
      create: {
        ...rule.txRule,
      },
    };

    return this.createRule(alertInput);
  }

  async createFnCallRule(
    user: User,
    rule: FnCallRuleSchema,
  ): Promise<{ name: AlertRule['name']; id: AlertRule['id'] }> {
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildRuleInput(user, {
      ...rule,
      name:
        rule.name ||
        `Function ${rule.fnCallRule.function} called in ${address}`,
    });

    alertInput.fnCallRule = {
      create: {
        params: {}, // TODO remove this when it can be set from the client
        ...rule.fnCallRule,
      },
    };

    return this.createRule(alertInput);
  }

  async createEventRule(
    user: User,
    rule: EventRuleSchema,
  ): Promise<{ name: AlertRule['name']; id: AlertRule['id'] }> {
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildRuleInput(user, {
      ...rule,
      name: rule.name || `Event ${rule.eventRule.event} logged in ${address}`,
    });

    alertInput.eventRule = {
      create: {
        data: {}, // TODO remove this when it can be set from the client
        ...rule.eventRule,
      },
    };

    return this.createRule(alertInput);
  }

  async createAcctBalRule(
    user: User,
    rule: AcctBalRuleSchema,
  ): Promise<{ name: AlertRule['name']; id: AlertRule['id'] }> {
    const address = await this.getContractAddress(rule.contract);

    const alertInput = this.buildRuleInput(user, {
      ...rule,
      name: rule.name || `Account balance changed in ${address}`,
    });

    alertInput.acctBalRule = {
      create: {
        ...rule.acctBalRule,
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

  private buildRuleInput(
    user: User,
    rule: AlertRuleBaseSchema,
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
  ): Promise<{ name: AlertRule['name']; id: AlertRule['id'] }> {
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
    await this.checkUserPermission(
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
  private async checkUserPermission(
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
}
