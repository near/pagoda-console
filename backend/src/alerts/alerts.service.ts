import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  User,
  Prisma,
  AlertRuleType,
  AlertRule,
  AcctBalRule,
  EventRule,
  FnCallRule,
  TxRule,
} from '@prisma/client';
import { AppConfig } from 'src/config/validate';
import { assertUnreachable } from 'src/helpers';
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

  async createRule(
    user: User,
    rule: TxRuleSchema | FnCallRuleSchema | EventRuleSchema | AcctBalRuleSchema,
  ): Promise<{ name: AlertRule['name']; id: AlertRule['id'] }> {
    const { name, type, environment, contract } = rule;
    await this.checkUserPermission(user.id, environment, contract);

    let alert;

    try {
      const alertInput: Prisma.AlertRuleCreateInput = {
        name: name || (await this.buildName(contract, type, rule)),
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

      switch (type) {
        case 'TX_SUCCESS':
        case 'TX_FAILURE':
          alertInput.txRule = {
            create: {
              ...(rule as TxRuleSchema).txRule,
            },
          };
          break;
        case 'FN_CALL':
          alertInput.fnCallRule = {
            create: {
              params: null, // TODO this can be removed once params can be set in the Dto
              ...(rule as FnCallRuleSchema).fnCallRule,
            },
          };
          break;
        case 'EVENT':
          alertInput.eventRule = {
            create: {
              data: null, // TODO this can be removed once data can be set in the Dto
              ...(rule as EventRuleSchema).eventRule,
            },
          };
          break;
        case 'ACCT_BAL_NUM':
        case 'ACCT_BAL_PCT':
          alertInput.acctBalRule = {
            create: {
              ...(rule as AcctBalRuleSchema).acctBalRule,
            },
          };
          break;
        default:
          assertUnreachable(type);
      }

      alert = await this.prisma.alertRule.create({
        data: alertInput,
        select: {
          name: true,
          id: true,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while executing alert creation query');
    }

    return {
      name: alert.name,
      id: alert.id,
    };
  }

  private async buildName(
    contractId: number,
    ruleType: AlertRuleType,
    rule: TxRuleSchema | FnCallRuleSchema | EventRuleSchema | AcctBalRuleSchema,
  ): Promise<string> {
    const address = await this.getContractAddress(contractId);

    switch (ruleType) {
      case 'TX_SUCCESS':
        return `Successful transaction in ${address}`;
      case 'TX_FAILURE':
        return `Failed transaction in ${address}`;
      case 'FN_CALL':
        return `Function ${
          (rule as FnCallRuleSchema).fnCallRule.function
        } called in ${address}`;
      case 'ACCT_BAL_PCT':
      case 'ACCT_BAL_NUM':
        return `Account balance changed in ${address}`;
      case 'EVENT':
        return `Event ${
          (rule as EventRuleSchema).eventRule.event
        } logged in ${address}`;
      default:
        assertUnreachable(ruleType);
    }
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
