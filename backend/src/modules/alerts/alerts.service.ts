import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Alert,
  WebhookDestination,
  AlertRuleKind,
  Destination,
  EmailDestination,
  DestinationType,
  TelegramDestination,
  ChainId,
} from '../../../generated/prisma/alerts';

// TODO should we re-export these types from the core module? So there is no dependency on the core prisma/client
// yes
import { User, Project } from '../../../generated/prisma/core';
import { PermissionsService as ProjectPermissionsService } from '../../core/projects/permissions.service';

import { customAlphabet } from 'nanoid';

import { PrismaService } from './prisma.service';
import { VError } from 'verror';
import { PremapDestination, RuleType } from './types';
import { RuleSerializerService } from './serde/rule-serializer/rule-serializer.service';
import { RuleDeserializerService } from './serde/rule-deserializer/rule-deserializer.service';
import {
  AcctBalMatchingRule,
  MatchingRule,
  TxMatchingRule,
} from './serde/db.types';
import { ReadonlyService as ProjectsReadonlyService } from '../../core/projects/readonly.service';
import { assertUnreachable } from 'src/helpers';
import { AppConfig } from 'src/config/validate';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { EmailService } from '@/src/core/email/email.service';
import { NearRpcService } from '@/src/core/near-rpc/near-rpc.service';

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
    from: string | null;
    to: string | null;
  };
};

type CreateAlertBaseSchema = {
  name?: Alert['name'];
  type: RuleType;
  projectSlug: Alert['projectSlug'];
  environmentSubId: Alert['environmentSubId'];
  destinations?: Array<Destination['id']>;
};
type RuleWithContractSchema = {
  rule: {
    contract: string;
  };
};
type CreateTxAlertSchema = CreateAlertBaseSchema & TxRuleSchema;
type CreateFnCallAlertSchema = CreateAlertBaseSchema & FnCallRuleSchema;
type CreateEventAlertSchema = CreateAlertBaseSchema & EventRuleSchema;
type CreateAcctBalAlertSchema = CreateAlertBaseSchema & AcctBalRuleSchema;

type CreateWebhookDestinationSchema = {
  name?: Destination['name'];
  projectSlug: Destination['projectSlug'];
  config: {
    url: WebhookDestination['url'];
  };
};

type CreateWebhookDestinationResponse = {
  id: WebhookDestination['id'];
  name?: Destination['name'];
  type: DestinationType;
  projectSlug: Destination['projectSlug'];
  config: {
    url: WebhookDestination['url'];
    secret: WebhookDestination['secret'];
  };
};

type CreateEmailDestinationSchema = {
  name?: Destination['name'];
  projectSlug: Destination['projectSlug'];
  config: {
    email: EmailDestination['email'];
  };
};

type CreateEmailDestinationResponse = {
  id: EmailDestination['id'];
  name?: Destination['name'];
  type: DestinationType;
  projectSlug: Destination['projectSlug'];
  config: {
    email: EmailDestination['email'];
    isVerified: EmailDestination['isVerified'];
  };
};

type UpdateWebhookDestinationSchema = {
  id: Destination['id'];
  name?: Destination['name'];
  config?: {
    url?: WebhookDestination['url'];
  };
};

type UpdateEmailDestinationSchema = {
  id: Destination['id'];
  name?: Destination['name'];
};

type UpdateTelegramDestinationSchema = {
  id: Destination['id'];
  name?: Destination['name'];
};

type CreateTelegramDestinationSchema = {
  name?: Destination['name'];
  projectSlug: Destination['projectSlug'];
};

type CreateTelegramDestinationResponse = {
  id: EmailDestination['id'];
  name?: Destination['name'];
  type: DestinationType;
  projectSlug: Destination['projectSlug'];
  config: {
    startToken: TelegramDestination['startToken'];
    chatTitle: TelegramDestination['chatTitle'];
  };
};

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12,
);

const nanoidLong = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  30,
);

type AlertWithDestinations = Alert & {
  enabledDestinations: Array<{
    destination: {
      id: Destination['id'];
      name: Destination['name'];
      type: Destination['type'];
      webhookDestination?: {
        url: WebhookDestination['url'];
      };
      emailDestination?: {
        email: EmailDestination['email'];
      };
      telegramDestination?: Pick<
        TelegramDestination,
        'startToken' | 'chatTitle'
      >;
    };
  }>;
};

@Injectable()
export class AlertsService {
  private emailTokenExpiryMin: number;
  private telegramTokenExpiryMin: number;
  private contractAddressValidationEnabled: string;
  constructor(
    private prisma: PrismaService,
    private projectPermissions: ProjectPermissionsService,
    private projects: ProjectsReadonlyService,
    private ruleSerializer: RuleSerializerService,
    private ruleDeserializer: RuleDeserializerService,
    private config: ConfigService<AppConfig>,
    private emailsService: EmailService,
    private nearRpc: NearRpcService,
  ) {
    this.emailTokenExpiryMin = this.config.get('alerts.emailTokenExpiryMin', {
      infer: true,
    });
    this.telegramTokenExpiryMin = this.config.get(
      'alerts.telegram.tokenExpiryMin',
      {
        infer: true,
      },
    );
    this.contractAddressValidationEnabled = this.config.get(
      'featureEnabled.alerts.contractAddressValidation',
      { infer: true },
    );
  }

  async createTxSuccessAlert(user: User, alert: CreateTxAlertSchema) {
    const { contract } = alert.rule;
    const defaultName = `Successful transaction in ${contract}`;
    alert = {
      ...alert,
      name: alert.name || defaultName,
    };
    const matchingRule = this.ruleSerializer.toTxSuccessJson(alert.rule);

    return this.createAlertRuleWithContract(user, alert, matchingRule);
  }

  async createTxFailureAlert(user: User, alert: CreateTxAlertSchema) {
    const { contract } = alert.rule;
    const defaultName = `Failed transaction in ${contract}`;
    alert = {
      ...alert,
      name: alert.name || defaultName,
    };
    const matchingRule = this.ruleSerializer.toTxFailureJson(alert.rule);

    return this.createAlertRuleWithContract(user, alert, matchingRule);
  }

  async createFnCallAlert(user: User, alert: CreateFnCallAlertSchema) {
    const { contract } = alert.rule;
    const defaultName = `Function ${alert.rule.function} called in ${contract}`;
    alert = {
      ...alert,
      name: alert.name || defaultName,
    };
    const matchingRule = this.ruleSerializer.toFnCallJson(alert.rule);

    return this.createAlertRuleWithContract(user, alert, matchingRule);
  }

  async createEventAlert(user: User, alert: CreateEventAlertSchema) {
    const { event, contract } = alert.rule;
    const defaultName = `Event ${event} logged in ${contract}`;
    alert = {
      ...alert,
      name: alert.name || defaultName,
    };
    const matchingRule = this.ruleSerializer.toEventJson(alert.rule);

    return this.createAlertRuleWithContract(user, alert, matchingRule);
  }

  async createAcctBalAlert(user: User, alert: CreateAcctBalAlertSchema) {
    const { contract } = alert.rule;
    const defaultName = `Account balance changed in ${contract}`;

    alert = {
      ...alert,
      name: alert.name || defaultName,
    };
    const matchingRule = this.ruleSerializer.toAcctBalJson(
      alert.rule,
      alert.type,
    );

    return this.createAlertRuleWithContract(user, alert, matchingRule);
  }

  private async createAlertRuleWithContract(
    user: User,
    alert: CreateAlertBaseSchema & RuleWithContractSchema,
    matchingRule: MatchingRule,
  ) {
    const chainId = await this.projects.getEnvironmentNet(
      alert.projectSlug,
      alert.environmentSubId,
    );
    const address = alert.rule.contract;

    await Promise.all([
      this.checkUserCreateAlertPermission(user, alert),
      this.checkAddressExists(chainId, address),
    ]);

    const alertInput = await this.buildCreateAlertInput(
      user,
      chainId,
      alert,
      AlertRuleKind.ACTIONS,
      matchingRule,
    );

    return this.createAlert(alertInput);
  }

  // Checks if the alert's address exists on the Near blockchain.
  private async checkAddressExists(net: ChainId, address: string) {
    if (!this.contractAddressValidationEnabled) {
      return;
    }

    // Ignore trying to process any address containing a wildcard. We could refine this.
    if (address.includes('*')) {
      return;
    }

    const status = await this.nearRpc.checkAccountExists(net, address);
    if (status === 'NOT_FOUND') {
      throw new VError(
        {
          info: {
            code: 'NOT_FOUND',
            response: 'ADDRESS_NOT_FOUND',
          },
        },
        'Alert address not found',
      );
    }
  }

  private async buildCreateAlertInput(
    user: User,
    chainId: ChainId,
    alert: CreateAlertBaseSchema,
    alertRuleKind: AlertRuleKind,
    matchingRule,
  ): Promise<Prisma.AlertCreateInput> {
    const { name, projectSlug, environmentSubId, destinations } = alert;

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
      const alert = await this.prisma.alert.create({
        data,
        include: {
          enabledDestinations: {
            select: {
              destination: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  webhookDestination: {
                    select: {
                      url: true,
                    },
                  },
                  emailDestination: {
                    select: {
                      email: true,
                    },
                  },
                  telegramDestination: {
                    select: {
                      startToken: true,
                      chatTitle: true,
                    },
                  },
                },
              },
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
          enabledDestinations: {
            select: {
              destination: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  webhookDestination: {
                    select: {
                      url: true,
                    },
                  },
                  emailDestination: {
                    select: {
                      email: true,
                    },
                  },
                  telegramDestination: {
                    select: {
                      startToken: true,
                      chatTitle: true,
                    },
                  },
                },
              },
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
        enabledDestinations: {
          select: {
            destination: {
              select: {
                id: true,
                name: true,
                type: true,
                webhookDestination: {
                  select: {
                    url: true,
                  },
                },
                emailDestination: {
                  select: {
                    email: true,
                  },
                },
                telegramDestination: {
                  select: {
                    startToken: true,
                    chatTitle: true,
                  },
                },
              },
            },
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
          enabledDestinations: {
            select: {
              destination: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  webhookDestination: {
                    select: {
                      url: true,
                    },
                  },
                  emailDestination: {
                    select: {
                      email: true,
                    },
                  },
                  telegramDestination: {
                    select: {
                      startToken: true,
                      chatTitle: true,
                    },
                  },
                },
              },
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
    const {
      id,
      name,
      isPaused,
      projectSlug,
      environmentSubId,
      matchingRule,
      enabledDestinations,
    } = alert;
    const rule = matchingRule as object as MatchingRule;
    return {
      id,
      type: this.toAlertType(rule),
      name,
      isPaused,
      projectSlug,
      environmentSubId,
      rule: this.ruleDeserializer.toRuleDto(rule),
      enabledDestinations: enabledDestinations.map((enabledDestination) => {
        const {
          id,
          name,
          type,
          webhookDestination,
          emailDestination,
          telegramDestination,
        } = enabledDestination.destination;
        let config;
        switch (type) {
          case 'WEBHOOK':
            config = webhookDestination;
            break;
          case 'EMAIL':
            config = emailDestination;
            break;
          case 'TELEGRAM':
            config = telegramDestination;
            break;
          default:
            assertUnreachable(type);
        }
        return {
          id,
          name,
          type,
          config,
        };
      }),
    };
  }

  public toAlertType(rule: MatchingRule): RuleType {
    if (
      rule.rule === 'ACTION_ANY' &&
      (rule as TxMatchingRule).status === 'SUCCESS'
    ) {
      return 'TX_SUCCESS';
    }

    if (
      rule.rule === 'ACTION_ANY' &&
      (rule as TxMatchingRule).status === 'FAIL'
    ) {
      return 'TX_FAILURE';
    }

    if (rule.rule === 'ACTION_FUNCTION_CALL') {
      return 'FN_CALL';
    }

    if (rule.rule === 'EVENT') {
      return 'EVENT';
    }

    if (rule.rule === 'STATE_CHANGE_ACCOUNT_BALANCE') {
      return (rule as AcctBalMatchingRule).comparator_kind ===
        'RELATIVE_PERCENTAGE_AMOUNT'
        ? 'ACCT_BAL_PCT'
        : 'ACCT_BAL_NUM';
    }

    throw new VError('Failed while deserializing alert type', {
      rule: rule.rule,
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
          isPaused: true,
          updatedBy: callingUser.id,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while soft deleting alert');
    }
  }

  async createWebhookDestination(
    user: User,
    {
      name = 'Webhook Destination',
      config: { url },
      projectSlug,
    }: CreateWebhookDestinationSchema,
  ): Promise<CreateWebhookDestinationResponse> {
    await this.projectPermissions.checkUserProjectPermission(
      user.id,
      projectSlug,
    );

    try {
      const res = await this.prisma.destination.create({
        data: {
          name,
          projectSlug,
          type: 'WEBHOOK',
          isValid: true,
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
          type: true,
          projectSlug: true,
          isValid: true,
          webhookDestination: {
            select: {
              url: true,
              secret: true,
            },
          },
        },
      });

      return this.transformDestinationRes(res);
    } catch (e) {
      throw new VError(e, 'Failed to create webhook destination');
    }
  }

  async createEmailDestination(
    user: User,
    {
      name = 'Email Destination',
      config: { email },
      projectSlug,
    }: CreateEmailDestinationSchema,
  ): Promise<CreateEmailDestinationResponse> {
    await this.projectPermissions.checkUserProjectPermission(
      user.id,
      projectSlug,
    );
    try {
      const expiryDate = this.calculateExpiryDate(this.emailTokenExpiryMin);
      const token = nanoid();
      const res = await this.prisma.destination.create({
        data: {
          name,
          projectSlug,
          type: 'EMAIL',
          createdBy: user.id,
          updatedBy: user.id,
          emailDestination: {
            create: {
              email,
              createdBy: user.id,
              updatedBy: user.id,
              isVerified: false,
              tokenExpiresAt: expiryDate,
              token,
            },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          projectSlug: true,
          isValid: true,
          emailDestination: {
            select: {
              email: true,
              isVerified: true,
            },
          },
        },
      });

      await this.emailsService.sendEmailVerificationMessage(email, token);

      return this.transformDestinationRes(res);
    } catch (e) {
      throw new VError(e, 'Failed to create email destination');
    }
  }

  async createTelegramDestination(
    user: User,
    {
      name = 'Telegram Destination',
      projectSlug,
    }: CreateTelegramDestinationSchema,
  ): Promise<CreateTelegramDestinationResponse> {
    await this.projectPermissions.checkUserProjectPermission(
      user.id,
      projectSlug,
    );
    try {
      const expiryDate = this.calculateExpiryDate(this.telegramTokenExpiryMin);
      const res = await this.prisma.destination.create({
        data: {
          name,
          projectSlug,
          type: 'TELEGRAM',
          createdBy: user.id,
          updatedBy: user.id,
          telegramDestination: {
            create: {
              startToken: nanoid(),
              tokenExpiresAt: expiryDate,
              createdBy: user.id,
              updatedBy: user.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          projectSlug: true,
          isValid: true,
          telegramDestination: {
            select: {
              startToken: true,
              chatTitle: true,
            },
          },
        },
      });

      return this.transformDestinationRes(res);
    } catch (e) {
      throw new VError(e, 'Failed to create telegram destination');
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

    const destinations = await this.prisma.destination.findMany({
      where: {
        active: true,
        projectSlug,
      },
      select: {
        id: true,
        name: true,
        projectSlug: true,
        type: true,
        isValid: true,
        webhookDestination: {
          select: {
            url: true,
            secret: true,
          },
        },
        emailDestination: {
          select: {
            email: true,
            isVerified: true,
          },
        },
        telegramDestination: {
          select: {
            startToken: true,
            chatTitle: true,
          },
        },
      },
    });

    return destinations.map(this.transformDestinationRes);
  }

  async enableDestination(
    callingUser: User,
    alertId: Alert['id'],
    destinationId: Destination['id'],
  ) {
    await this.checkUserAlertPermission(callingUser.id, alertId);
    await this.checkAlertDestinationPermission(alertId, destinationId);

    const destination = await this.prisma.enabledDestination.findUnique({
      where: {
        destinationId_alertId: {
          alertId,
          destinationId,
        },
      },
    });

    // If the destination already exists, then it's already enabled.
    if (destination) {
      return;
    }

    try {
      await this.prisma.enabledDestination.create({
        data: {
          alertId,
          destinationId,
          createdBy: callingUser.id,
          updatedBy: callingUser.id,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while creating enabled destination');
    }
  }

  async disableDestination(
    callingUser: User,
    alertId: Alert['id'],
    destinationId: Destination['id'],
  ) {
    await this.checkUserAlertPermission(callingUser.id, alertId);

    const destination = await this.prisma.enabledDestination.findUnique({
      where: {
        destinationId_alertId: {
          alertId,
          destinationId,
        },
      },
    });

    // If the destination doesn't exist, then it's already disabled.
    if (!destination) {
      return;
    }

    try {
      await this.prisma.enabledDestination.delete({
        where: {
          destinationId_alertId: {
            alertId,
            destinationId,
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while deleting enabled destination');
    }
  }

  async updateWebhookDestination(
    callingUser: User,
    dto: UpdateWebhookDestinationSchema,
  ) {
    const { id, name, config } = dto;
    await this.checkUserDestinationPermission(callingUser.id, id);

    try {
      const res = await this.prisma.destination.update({
        where: {
          id,
        },
        data: {
          name,
          updatedBy: callingUser.id,
          webhookDestination: {
            update: {
              url: config?.url,
              updatedBy: callingUser.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          projectSlug: true,
          isValid: true,
          webhookDestination: {
            select: {
              url: true,
              secret: true,
            },
          },
        },
      });
      return this.transformDestinationRes(res);
    } catch (e) {
      throw new VError(e, 'Failed while updating webhook destination');
    }
  }

  async updateEmailDestination(
    callingUser: User,
    dto: UpdateEmailDestinationSchema,
  ) {
    const { id, name } = dto;
    await this.checkUserDestinationPermission(callingUser.id, id);

    try {
      const res = await this.prisma.destination.update({
        where: {
          id,
        },
        data: {
          name,
          updatedBy: callingUser.id,
        },
        select: {
          id: true,
          name: true,
          type: true,
          projectSlug: true,
          isValid: true,
          emailDestination: {
            select: {
              email: true,
            },
          },
        },
      });
      return this.transformDestinationRes(res);
    } catch (e) {
      throw new VError(e, 'Failed while updating email destination');
    }
  }

  async updateTelegramDestination(
    callingUser: User,
    dto: UpdateTelegramDestinationSchema,
  ) {
    const { id, name } = dto;
    await this.checkUserDestinationPermission(callingUser.id, id);

    try {
      const res = await this.prisma.destination.update({
        where: {
          id,
        },
        data: {
          name,
          updatedBy: callingUser.id,
        },
        select: {
          id: true,
          name: true,
          type: true,
          projectSlug: true,
          isValid: true,
          telegramDestination: {
            select: {
              startToken: true,
              chatTitle: true,
            },
          },
        },
      });
      return this.transformDestinationRes(res);
    } catch (e) {
      throw new VError(e, 'Failed while updating telegram destination');
    }
  }

  async verifyEmailDestination(token: EmailDestination['token']) {
    try {
      const emailDestination = await this.prisma.emailDestination.findUnique({
        where: {
          token,
        },
        select: {
          id: true,
          tokenExpiresAt: true,
          destination: {
            select: {
              id: true,
              active: true,
            },
          },
        },
      });
      if (!emailDestination || !emailDestination.tokenExpiresAt) {
        throw new VError(
          { info: { code: 'BAD_DESTINATION' } },
          'Destination not found or incomplete',
        );
      }

      if (!emailDestination.destination.active) {
        throw new VError(
          { info: { code: 'BAD_DESTINATION' } },
          'Destination not found',
        );
      }

      // Checks if the difference between the date and now is negative i.e. the expiration date has passed
      if (
        DateTime.fromJSDate(emailDestination.tokenExpiresAt)
          .diffNow()
          .valueOf() < 0
      ) {
        throw new VError(
          { info: { code: 'BAD_TOKEN_EXPIRED' } },
          'Token expired',
        );
      }

      await this.prisma.destination.update({
        where: {
          id: emailDestination.destination.id,
        },
        data: {
          isValid: true,
          emailDestination: {
            update: {
              isVerified: true,
              token: null,
              tokenExpiresAt: null,
              unsubscribeToken: nanoidLong(),
            },
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while verifying email destination');
    }
  }

  async resendEmailVerification(callingUser: User, id: Destination['id']) {
    await this.checkUserDestinationPermission(callingUser.id, id);

    try {
      const targetDestination = await this.prisma.destination.findUnique({
        where: {
          id,
        },
      });

      if (targetDestination.type != 'EMAIL') {
        throw new VError(
          { info: { code: 'BAD_DESTINATION' } },
          'Destination not found',
        );
      }

      if (!targetDestination.active) {
        throw new VError(
          { info: { code: 'BAD_DESTINATION' } },
          'Destination not found',
        );
      }

      if (targetDestination.isValid) {
        // destination already verified
        throw new VError(
          { info: { code: 'BAD_DESTINATION' } },
          'Destination already verified',
        );
      }

      const token = nanoid();
      const expiryDate = this.calculateExpiryDate(this.emailTokenExpiryMin);
      const res = await this.prisma.destination.update({
        where: {
          id,
        },
        data: {
          updatedBy: callingUser.id,
          emailDestination: {
            update: {
              token,
              tokenExpiresAt: expiryDate,
            },
          },
        },
        select: {
          emailDestination: {
            select: {
              token: true,
              email: true,
            },
          },
        },
      });
      await this.emailsService.sendEmailVerificationMessage(
        res.emailDestination.email,
        res.emailDestination.token,
      );
    } catch (e) {
      throw new VError(e, 'Failed while resending email verification');
    }
  }

  async unsubscribeFromEmailAlert(token: EmailDestination['unsubscribeToken']) {
    try {
      await this.prisma.emailDestination.update({
        where: {
          unsubscribeToken: token,
        },
        data: {
          unsubscribeToken: null,
          destination: {
            update: {
              active: false,
            },
          },
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while unsubscribing from email alerts');
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

  /**
   * Check that a destination is assignable to a given alert
   *
   * Throws if destination and alert are not compatible
   *
   * Assumes alert validity has already been checked
   */
  private async checkAlertDestinationPermission(
    alertId: number,
    destinationId: number,
  ) {
    const alert = await this.prisma.alert.findUnique({
      where: {
        id: alertId,
      },
      select: {
        projectSlug: true,
      },
    });

    if (!alert) {
      // extra safeguard, should have already been checked by another function
      throw new VError({ info: { code: 'BAD_ALERT' } }, 'Alert not found');
    }

    const matchedDestination = await this.prisma.destination.findUnique({
      where: {
        id: destinationId,
      },
      select: {
        projectSlug: true,
        active: true,
        isValid: true,
      },
    });

    if (!matchedDestination) {
      throw new VError(
        { info: { code: 'BAD_DESTINATION' } },
        'Destination not found',
      );
    }

    if (!matchedDestination.active) {
      throw new VError(
        { info: { code: 'BAD_DESTINATION' } },
        'Destination is inactive',
      );
    }

    if (!matchedDestination.isValid) {
      throw new VError(
        { info: { code: 'BAD_DESTINATION' } },
        'Destination is not valid',
      );
    }

    if (matchedDestination.projectSlug !== alert.projectSlug) {
      throw new VError(
        { info: { code: 'PERMISSION_DENIED' } },
        'Destination cannot be assigned to alert',
      );
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

  private transformDestinationRes(destination: PremapDestination) {
    const { id, name, projectSlug, type, isValid } = destination;
    let config;
    switch (type) {
      case 'WEBHOOK':
        config = destination.webhookDestination;
        break;
      case 'EMAIL':
        config = destination.emailDestination;
        break;
      case 'TELEGRAM':
        config = destination.telegramDestination;
        break;
      default:
        assertUnreachable(type);
    }
    return {
      id,
      name,
      projectSlug,
      type,
      isValid,
      config,
    };
  }

  private calculateExpiryDate(expiryMin: number): Date {
    return DateTime.now().plus({ minutes: expiryMin }).toUTC().toJSDate();
  }
}
