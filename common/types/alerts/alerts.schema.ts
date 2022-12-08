import { z } from 'zod';
import { AlertRuleKind, DestinationType } from '@pc/database/clients/alerts';
import { accountId, environmentId, projectSlug, net } from '../core/types';
import { json } from '../schemas';
import { flavored, Flavored } from '../utils';

export const destinationType: z.ZodType<DestinationType> = z.enum([
  'WEBHOOK',
  'EMAIL',
  'TELEGRAM',
]);
export const alertRuleKind: z.ZodType<AlertRuleKind> = z.enum([
  'ACTIONS',
  'EVENTS',
  'STATE_CHANGES',
]);

export const alertId = z.number().refine<Flavored<'alertId', number>>(flavored);
export type AlertId = z.infer<typeof alertId>;

export const destinationId = z
  .number()
  .refine<Flavored<'destinationId', number>>(flavored);
export type DestinationId = z.infer<typeof destinationId>;

export const alertName = z.string();
export const databaseAlert = z.strictObject({
  id: z.number(),
  alertRuleKind,
  name: alertName,
  matchingRule: json,
  isPaused: z.boolean(),
  projectSlug,
  environmentSubId: environmentId,
  chainId: net,
  active: z.boolean(),
  createdAt: z.date(),
  createdBy: z.number(),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const destinationName = z.string();
export const databaseDestination = z.strictObject({
  id: z.number(),
  name: z.string().or(z.null()),
  projectSlug,
  type: destinationType,
  active: z.boolean(),
  isValid: z.boolean(),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const databaseWebhookDestination = z.strictObject({
  id: z.number(),
  destinationId: z.number(),
  url: z.string().url(),
  secret: z.string(),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const databaseEmailDestination = z.strictObject({
  id: z.number(),
  destinationId: z.number(),
  email: z.string().email(),
  token: z.string().or(z.null()),
  isVerified: z.boolean(),
  tokenExpiresAt: z.date().or(z.null()),
  tokenCreatedAt: z.date().or(z.null()),
  unsubscribeToken: z.string().or(z.null()),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const databaseTelegramDestination = z.strictObject({
  id: z.number(),
  destinationId: z.number(),
  chatId: z.number().or(z.null()),
  chatTitle: z.string().or(z.null()),
  isGroupChat: z.boolean().or(z.null()),
  startToken: z.string().or(z.null()),
  tokenExpiresAt: z.date().or(z.null()),
  createdAt: z.date(),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const comparator = z.enum(['EQ', 'LTE', 'GTE', 'RANGE']);
export type Comparator = z.infer<typeof comparator>;

const percentage = z.number().int().min(0).max(100);
const upperBound = BigInt('340282366920938463463374607431768211456'); // 2^128
const yoctoNear = z
  .string()
  .regex(/^0$|^[1-9][0-9]*$/)
  .refine((input) => {
    const bigint = BigInt(input);
    return bigint >= 0 && bigint < upperBound;
  }, 'Values "to" and "from" should be integers within the range of [0, 2^128)');

const acctBalPctRule = z
  .strictObject({
    type: z.literal('ACCT_BAL_PCT'),
    contract: accountId,
    from: percentage.optional(),
    to: percentage.optional(),
  })
  // Should we use union of
  // { from: number, to: number } |
  // { from?: number, to: number } |
  // { from: number, to?: number }
  // to validate this instead?
  .refine(
    (input) => input.to !== undefined || input.from !== undefined,
    '"rule.from" or "rule.to" is required',
  )
  .refine(
    (input) =>
      input.to === undefined ||
      input.from === undefined ||
      input.to >= input.from,
    {
      message: '"rule.from" must be less than or equal to "rule.to"',
    },
  );
export type AcctBalPctRule = z.infer<typeof acctBalPctRule>;

const acctBalNumRule = z
  .strictObject({
    type: z.literal('ACCT_BAL_NUM'),
    contract: accountId,
    from: yoctoNear.optional(),
    to: yoctoNear.optional(),
  })
  .refine(
    (input) => input.to !== undefined || input.from !== undefined,
    '"rule.from" or "rule.to" is required',
  )
  .refine(
    (input) =>
      input.to === undefined ||
      input.from === undefined ||
      BigInt(input.to) >= BigInt(input.from),
    {
      message: '"rule.from" must be less than or equal to "rule.to"',
    },
  );
export type AcctBalNumRule = z.infer<typeof acctBalNumRule>;

export type Rule =
  | TransactionRule
  | FunctionCallRule
  | EventRule
  | AcctBalPctRule
  | AcctBalNumRule;

const transactionRule = z.strictObject({
  type: z.enum(['TX_SUCCESS', 'TX_FAILURE']),
  contract: accountId,
});
export type TransactionRule = z.infer<typeof transactionRule>;

const functionCallRule = z.strictObject({
  type: z.literal('FN_CALL'),
  contract: accountId,
  function: z.string(),
});
export type FunctionCallRule = z.infer<typeof functionCallRule>;

const eventRule = z.strictObject({
  type: z.literal('EVENT'),
  contract: accountId,
  event: z.string(),
  standard: z.string(),
  version: z.string(),
});
export type EventRule = z.infer<typeof eventRule>;

export const rule = z.union([
  transactionRule,
  functionCallRule,
  eventRule,
  acctBalPctRule,
  acctBalNumRule,
]);

const updateDestinationBaseInput = z.strictObject({
  id: destinationId,
  name: destinationName.optional(),
});
export type UpdateDestinationBaseInput = z.infer<
  typeof updateDestinationBaseInput
>;

const updateWebhookDestinationConfig = z.strictObject({
  type: z.literal('WEBHOOK'),
  url: z.string(),
});
export type UpdateWebhookDestinationConfig = z.infer<
  typeof updateWebhookDestinationConfig
>;
const updateEmailDestinationConfig = z.strictObject({
  type: z.literal('EMAIL'),
});
const updateTelegramDestinationConfig = z.strictObject({
  type: z.literal('TELEGRAM'),
});

const createBaseDestinationInput = z.strictObject({
  name: destinationName.optional(),
  projectSlug,
});
export type CreateBaseDestinationInput = z.infer<
  typeof createBaseDestinationInput
>;

const createWebhookDestinationConfig = z.strictObject({
  type: z.literal('WEBHOOK'),
  url: z.string(),
});
export type CreateWebhookDestinationConfig = z.infer<
  typeof createWebhookDestinationConfig
>;

const createEmailDestinationConfig = z.strictObject({
  type: z.literal('EMAIL'),
  email: z.string(),
});
export type CreateEmailDestinationConfig = z.infer<
  typeof createEmailDestinationConfig
>;

const createTelegramDestinationConfig = z.strictObject({
  type: z.literal('TELEGRAM'),
});

const createDestinationInput = createBaseDestinationInput.merge(
  z.strictObject({
    config: z.discriminatedUnion('type', [
      createWebhookDestinationConfig,
      createEmailDestinationConfig,
      createTelegramDestinationConfig,
    ]),
  }),
);
export type CreateDestinationInput = z.infer<typeof createDestinationInput>;

const createAlertBaseInput = z.strictObject({
  name: alertName.optional(),
  projectSlug: projectSlug,
  environmentSubId: environmentId,
  destinations: z.array(destinationId).optional(),
});
export type CreateAlertBaseInput = z.infer<typeof createAlertBaseInput>;

const enabledDestination = databaseDestination
  .pick({ id: true, name: true })
  .merge(
    z.strictObject({
      config: z.discriminatedUnion('type', [
        z.strictObject({
          type: z.literal('EMAIL'),
          config: databaseEmailDestination.pick({ email: true }),
        }),
        z.strictObject({
          type: z.literal('WEBHOOK'),
          config: databaseWebhookDestination.pick({ url: true }),
        }),
        z.strictObject({
          type: z.literal('TELEGRAM'),
          config: databaseTelegramDestination.pick({
            chatTitle: true,
            startToken: true,
          }),
        }),
      ]),
    }),
  );

export const ruleType = z.union([
  transactionRule.shape.type,
  functionCallRule.shape.type,
  eventRule.shape.type,
  acctBalPctRule.innerType().innerType().shape.type,
  acctBalNumRule.innerType().innerType().shape.type,
]);
export type RuleType = z.infer<typeof ruleType>;

const alert = databaseAlert
  .pick({
    id: true,
    name: true,
    isPaused: true,
    projectSlug: true,
    environmentSubId: true,
  })
  .merge(
    z.strictObject({
      rule,
      enabledDestinations: enabledDestination.array(),
    }),
  );
export type Alert = z.infer<typeof alert>;

const baseDestination = databaseDestination.pick({
  id: true,
  name: true,
  projectSlug: true,
  isValid: true,
});
const webhookDestination = baseDestination.merge(
  z.strictObject({
    type: z.literal('WEBHOOK'),
    config: databaseWebhookDestination.pick({ url: true }).merge(
      z.strictObject({
        secret: z.string(),
      }),
    ),
  }),
);
export type WebhookDestination = z.infer<typeof webhookDestination>;
const emailDestination = baseDestination.merge(
  z.strictObject({
    type: z.literal('EMAIL'),
    config: databaseEmailDestination.pick({ email: true }),
  }),
);
export type EmailDestination = z.infer<typeof emailDestination>;
const telegramDestination = baseDestination.merge(
  z.strictObject({
    type: z.literal('TELEGRAM'),
    config: databaseTelegramDestination.pick({
      startToken: true,
      chatTitle: true,
    }),
  }),
);
export type TelegramDestination = z.infer<typeof telegramDestination>;
const destination = z.union([
  webhookDestination,
  emailDestination,
  telegramDestination,
]);
export type Destination = z.infer<typeof destination>;

const tgChat = z.union([
  z.object({
    type: z.literal('private'),
    id: z.number(),
    username: z.string().optional(),
  }),
  z.object({
    type: z.enum(['group', 'supergroup', 'channel']),
    id: z.number(),
    title: z.string().optional(),
  }),
]);
export type TgChat = z.infer<typeof tgChat>;

export const query = {
  inputs: {
    listAlerts: z.strictObject({
      projectSlug,
      environmentSubId: environmentId,
    }),
    getAlertDetails: z.strictObject({
      id: alertId,
    }),
    listDestinations: z.strictObject({
      projectSlug,
    }),
  },

  outputs: {
    listAlerts: alert.array(),
    getAlertDetails: alert,
    listDestinations: destination.array(),
  },

  errors: {
    listAlerts: z.unknown(),
    getAlertDetails: z.unknown(),
    listDestinations: z.unknown(),
  },
};

export const mutation = {
  inputs: {
    createAlert: createAlertBaseInput.merge(z.strictObject({ rule })),
    updateAlert: z.strictObject({
      id: alertId,
      name: alertName.optional(),
      isPaused: z.boolean().optional(),
    }),
    deleteAlert: z.strictObject({
      id: alertId,
    }),
    createDestination: createDestinationInput,
    deleteDestination: z.strictObject({
      id: destinationId,
    }),
    enableDestination: z.strictObject({
      alert: alertId,
      destination: destinationId,
    }),
    disableDestination: z.strictObject({
      alert: alertId,
      destination: destinationId,
    }),
    updateDestination: updateDestinationBaseInput.merge(
      z.strictObject({
        config: z.discriminatedUnion('type', [
          updateWebhookDestinationConfig,
          updateEmailDestinationConfig,
          updateTelegramDestinationConfig,
        ]),
      }),
    ),
    verifyEmailDestination: z.strictObject({
      token: z.string(),
    }),
    telegramWebhook: z.object({
      update_id: z.number(),
      message: z
        .object({
          chat: tgChat,
          text: z.string().optional(),
        })
        .optional(),
    }),
    resendEmailVerification: z.strictObject({
      destinationId,
    }),
    unsubscribeFromEmailAlert: z.strictObject({
      token: z.string(),
    }),
    rotateWebhookDestinationSecret: z.strictObject({
      destinationId,
    }),
  },

  outputs: {
    createAlert: alert,
    updateAlert: alert,
    deleteAlert: z.void(),
    createDestination: destination,
    deleteDestination: z.void(),
    enableDestination: z.void(),
    disableDestination: z.void(),
    updateDestination: destination,
    verifyEmailDestination: z.void(),
    telegramWebhook: z.void(),
    resendEmailVerification: z.void(),
    unsubscribeFromEmailAlert: z.void(),
    rotateWebhookDestinationSecret: webhookDestination,
  },

  errors: {
    createAlert: z.unknown(),
    updateAlert: z.unknown(),
    deleteAlert: z.unknown(),
    createDestination: z.unknown(),
    deleteDestination: z.unknown(),
    enableDestination: z.unknown(),
    disableDestination: z.unknown(),
    updateDestination: z.unknown(),
    verifyEmailDestination: z.unknown(),
    telegramWebhook: z.unknown(),
    resendEmailVerification: z.unknown(),
    unsubscribeFromEmailAlert: z.unknown(),
    rotateWebhookDestinationSecret: z.unknown(),
  },
};
