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
} from '../../generated/prisma/alerts';

// TODO should we re-export these types from the core module? So there is no dependency on the core prisma/client
// yes
import { User, Project } from '@prisma/client';
import { PermissionsService as ProjectPermissionsService } from 'src/projects/permissions.service';

import { customAlphabet } from 'nanoid';

import { PrismaService } from './prisma.service';
import { VError } from 'verror';
import { NumberComparator, RuleType } from './types';
import { RuleSerializerService } from './serde/rule-serializer/rule-serializer.service';
import { RuleDeserializerService } from './serde/rule-deserializer/rule-deserializer.service';
import { AcctBalMatchingRule, MatchingRule } from './serde/db.types';
import { ReadonlyService as ProjectsReadonlyService } from 'src/projects/readonly.service';
import { assertUnreachable } from 'src/helpers';
import { AppConfig } from 'src/config/validate';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';

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
  destinations?: Array<Destination['id']>;
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
  };
};

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  12,
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
    };
  }>;
};

@Injectable()
export class AlertsService {
  private emailTokenExpiryMin: number;
  private telegramTokenExpiryMin: number;
  constructor(
    private prisma: PrismaService,
    private projectPermissions: ProjectPermissionsService,
    private projects: ProjectsReadonlyService,
    private ruleSerializer: RuleSerializerService,
    private ruleDeserializer: RuleDeserializerService,
    private config: ConfigService<AppConfig>,
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
  }

  async createTxSuccessAlert(user: User, alert: CreateTxAlertSchema) {
    await this.checkUserCreateAlertPermission(user, alert);

    const address = alert.rule.contract;
    const alertInput = await this.buildCreateAlertInput(
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
    const alertInput = await this.buildCreateAlertInput(
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
    const alertInput = await this.buildCreateAlertInput(
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
    const alertInput = await this.buildCreateAlertInput(
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
    const alertInput = await this.buildCreateAlertInput(
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

  private async buildCreateAlertInput(
    user: User,
    alert: CreateAlertBaseSchema,
    alertRuleKind: AlertRuleKind,
    matchingRule,
  ): Promise<Prisma.AlertCreateInput> {
    const { name, projectSlug, environmentSubId, destinations } = alert;

    const chainId = await this.projects.getEnvironmentNet(
      projectSlug,
      environmentSubId,
    );

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
        const { id, name, type, webhookDestination, emailDestination } =
          enabledDestination.destination;
        let config;
        switch (type) {
          case 'WEBHOOK':
            config = webhookDestination;
            break;
          case 'EMAIL':
            config = emailDestination;
            break;
          case 'TELEGRAM':
            //TODO
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
      const c = await this.prisma.destination.create({
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
        type: c.type,
        projectSlug: c.projectSlug,
        config: {
          url: c.webhookDestination.url,
          secret: c.webhookDestination.secret,
        },
      };
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
      const expiryDate = DateTime.now()
        .plus({ minutes: this.emailTokenExpiryMin })
        .toUTC()
        .toJSDate();
      const c = await this.prisma.destination.create({
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
              token: nanoid(),
            },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          projectSlug: true,
          emailDestination: {
            select: {
              email: true,
              isVerified: true,
            },
          },
        },
      });

      return {
        id: c.id,
        name: c.name,
        type: 'EMAIL',
        projectSlug: c.projectSlug,
        config: {
          email: c.emailDestination.email,
          isVerified: c.emailDestination.isVerified,
        },
      };
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
      const expiryDate = DateTime.now()
        .plus({ minutes: this.telegramTokenExpiryMin })
        .toUTC()
        .toJSDate();
      const c = await this.prisma.destination.create({
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
          telegramDestination: {
            select: {
              startToken: true,
            },
          },
        },
      });

      return {
        id: c.id,
        name: c.name,
        type: 'TELEGRAM',
        projectSlug: c.projectSlug,
        config: {
          startToken: c.telegramDestination.startToken,
        },
      };
    } catch (e) {
      throw new VError(e, 'Failed to create email destination');
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
          },
        },
      },
    });

    return destinations.map((destination) => {
      const { id, name, projectSlug, type } = destination;
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
        config,
      };
    });
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
          webhookDestination: {
            select: {
              url: true,
              secret: true,
            },
          },
        },
      });
      return {
        id: res.id,
        name: res.name,
        type: res.type,
        projectSlug: res.projectSlug,
        config: res.webhookDestination,
      };
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
          emailDestination: {
            select: {
              email: true,
            },
          },
        },
      });
      return {
        id: res.id,
        name: res.name,
        type: res.type,
        projectSlug: res.projectSlug,
        config: res.emailDestination,
      };
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
          telegramDestination: {
            select: {
              startToken: true,
            },
          },
        },
      });
      return {
        id: res.id,
        name: res.name,
        type: res.type,
        projectSlug: res.projectSlug,
        config: res.telegramDestination,
      };
    } catch (e) {
      throw new VError(e, 'Failed while updating email destination');
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
}
