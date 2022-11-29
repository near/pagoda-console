import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// * Adding an environment variable? There are three places in this
// * file you must add it: the AppConfig interface, the appConfigSchema
// * Joi schema, and the structuredConfig object. While this is quite
// * a bit of boilerplate, it is not touched often and provides us the
// * best level of typing, validation and intuitive access

// * Using an environment variable? Always set the type of ConfigService
// * in the constructor and use {infer: true} in getter for proper
// * typing and nested access
// *
// * constructor example:
// * private config: ConfigService<AppConfig>
// *
// * getter example:
// * this.config.get('analytics.url', {infer: true});

export type Database = {
  host: string;
  database: string;
  user: string;
  password: string;
};

const databaseSchema = z.strictObject({
  host: z.string(),
  database: z.string(),
  user: z.string(),
  password: z.string(),
});

const rpcSchema = z.strictObject({
  url: z.string().url(),
});

const appConfigSchema = z.strictObject({
  deployEnv: z.enum(['LOCAL', 'DEVELOPMENT', 'STAGING', 'PRODUCTION']),
  port: z.preprocess(Number, z.number().int()),
  db: z.strictObject({
    connectionString: z.string(),
  }),
  nearRpc: z.strictObject({
    MAINNET: rpcSchema,
    TESTNET: rpcSchema,
  }),
  nearArchivalRpc: z.strictObject({
    MAINNET: rpcSchema,
    TESTNET: rpcSchema,
  }),
  indexerDatabase: z.strictObject({
    MAINNET: databaseSchema,
    TESTNET: databaseSchema,
  }),
  indexerActivityDatabase: z.strictObject({
    MAINNET: databaseSchema,
    TESTNET: databaseSchema.optional(),
  }),
  recentTransactionsCount: z.preprocess(Number, z.number().int()),
  projectRefPrefix: z.string(),
  firebase: z.strictObject({
    credentials: z.string(),
    clientConfig: z.string(),
  }),
  log: z.strictObject({
    queries: z.preprocess(Boolean, z.boolean()),
    indexer: z.preprocess(Boolean, z.boolean()),
  }),
  orgs: z.strictObject({
    inviteTokenExpiryMinutes: z.number(),
  }),
  alerts: z.strictObject({
    email: z.strictObject({
      tokenExpiryMin: z.preprocess(Number, z.number()),
      resendVerificationRatelimitMillis: z.preprocess(Number, z.number()),
    }),
    telegram: z
      .strictObject({
        tokenExpiryMin: z.number(),
        botToken: z.string(),
        secret: z.string(),
      })
      .optional(),
  }),
  mailgun: z.strictObject({
    domain: z.string(),
    apiKey: z.string(),
  }),
  email: z.strictObject({
    noReply: z.string(),
    alerts: z.strictObject({
      noReply: z.string(),
    }),
    mock: z.boolean(),
  }),
  frontend: z.strictObject({
    baseUrl: z.string(),
  }),
  featureEnabled: z.strictObject({
    core: z.strictObject({
      contractAddressValidation: z.boolean().optional().default(true),
    }),
    alerts: z.strictObject({
      contractAddressValidation: z.boolean().optional().default(true),
    }),
  }),
  metricsPort: z.number().int().optional().default(3030),
  rpcProvisioningService: z.union([
    z.strictObject({
      mock: z.literal(true),
    }),
    z.strictObject({
      mock: z.literal(false),
      url: z.string().url(),
      apiKey: z.string(),
    }),
  ]),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export default function validate(config: Record<string, any>): AppConfig {
  // read environment variables into structured object for
  // more organized access
  const structuredConfig: AppConfig = {
    deployEnv: config.DEPLOY_ENV,
    port: config.PORT,
    db: {
      connectionString: config.DATABASE_URL,
    },
    nearRpc: {
      TESTNET: {
        url: config.NEAR_RPC_URL_TEST || 'https://rpc.testnet.near.org',
      },
      MAINNET: {
        url: config.NEAR_RPC_URL_MAIN || 'https://rpc.mainnet.near.org',
      },
    },
    nearArchivalRpc: {
      TESTNET: {
        url:
          config.NEAR_ARCHIVAL_RPC_URL_TEST ||
          'https://archival-rpc.testnet.near.org',
      },
      MAINNET: {
        url:
          config.NEAR_ARCHIVAL_RPC_URL_MAIN ||
          'https://archival-rpc.mainnet.near.org',
      },
    },
    indexerDatabase: {
      MAINNET: {
        host:
          config.INDEXER_MAINNET_HOST || 'mainnet.db.explorer.indexer.near.dev',
        database: config.INDEXER_MAINNET_DATABASE || 'mainnet_explorer',
        user: config.INDEXER_MAINNET_USER || 'public_readonly',
        password: config.INDEXER_MAINNET_PASSWORD || 'nearprotocol',
      },
      TESTNET: {
        host:
          config.INDEXER_TESTNET_HOST || 'testnet.db.explorer.indexer.near.dev',
        database: config.INDEXER_TESTNET_DATABASE || 'testnet_explorer',
        user: config.INDEXER_TESTNET_USER || 'public_readonly',
        password: config.INDEXER_TESTNET_PASSWORD || 'nearprotocol',
      },
    },
    indexerActivityDatabase: {
      MAINNET: {
        host:
          config.INDEXER_ACTIVITY_MAINNET_HOST ||
          'mainnet.db.explorer.indexer.near.dev',
        database:
          config.INDEXER_ACTIVITY_MAINNET_DATABASE ||
          'mainnet_accounts_activity',
        user: config.INDEXER_ACTIVITY_MAINNET_USER || 'public_readonly',
        password: config.INDEXER_ACTIVITY_MAINNET_PASSWORD || 'nearprotocol',
      },
      TESTNET: config.INDEXER_ACTIVITY_TESTNET_USER
        ? {
            host:
              config.INDEXER_ACTIVITY_TESTNET_HOST ||
              'testnet.db.explorer.indexer.near.dev',
            database:
              config.INDEXER_ACTIVITY_TESTNET_DATABASE ||
              'testnet_accounts_activity',
            user: config.INDEXER_ACTIVITY_TESTNET_USER || 'public_readonly',
            password:
              config.INDEXER_ACTIVITY_TESTNET_PASSWORD || 'nearprotocol',
          }
        : undefined,
    },
    recentTransactionsCount: config.RECENT_TRANSACTIONS_COUNT,
    projectRefPrefix: config.PROJECT_REF_PREFIX || '',
    firebase: {
      credentials: config.FIREBASE_CREDENTIALS,
      clientConfig: config.FIREBASE_CLIENT_CONFIG,
    },
    log: {
      queries: config.LOG_QUERIES || false,
      indexer: config.LOG_INDEXER || false,
    },
    orgs: {
      // TODO set to a small value once requesting a new token is possible
      inviteTokenExpiryMinutes:
        config.ORGS_INVITE_TOKEN_EXPIRY_MINUTES || 10000,
    },
    alerts: {
      email: {
        // TODO set to a small value once requesting a new token is possible
        tokenExpiryMin: config.EMAIL_TOKEN_EXPIRY_MIN || 10000,
        resendVerificationRatelimitMillis:
          config.RESEND_VERIFICATION_RATE_LIMIT_MILLIS || 2000,
      },
      telegram:
        config.TELEGRAM_BOT_TOKEN && config.TELEGRAM_SECRET
          ? {
              // TODO set to a small value once requesting a new token is possible
              tokenExpiryMin: config.TELEGRAM_TOKEN_EXPIRY_MIN || 10000,
              botToken: config.TELEGRAM_BOT_TOKEN,
              secret: config.TELEGRAM_SECRET,
            }
          : undefined,
    },
    mailgun: {
      domain: config.MAILGUN_DOMAIN,
      apiKey: config.MAILGUN_API_KEY,
    },
    email: {
      mock: Boolean(config.MOCK_EMAIL_SERVICE),
      noReply: config.EMAIL_NO_REPLY,
      alerts: {
        noReply: config.EMAIL_ALERTS_NO_REPLY,
      },
    },
    frontend: {
      baseUrl: config.FRONTEND_BASE_URL,
    },
    featureEnabled: {
      core: {
        contractAddressValidation:
          config.CORE_CONTRACT_ADDRESS_VALIDATION_FEATURE_ENABLED,
      },
      alerts: {
        contractAddressValidation:
          config.ALERT_CONTRACT_ADDRESS_VALIDATION_FEATURE_ENABLED,
      },
    },
    metricsPort: config.METRICS_PORT,
    rpcProvisioningService:
      config.MOCK_KEY_SERVICE === 'true'
        ? { mock: true }
        : {
            mock: false,
            url: config.RPC_API_KEYS_URL,
            apiKey: config.RPC_API_KEYS_API_KEY,
          },
  };

  const parseResult = appConfigSchema.safeParse(structuredConfig);
  if (!parseResult.success) {
    throw new Error(fromZodError(parseResult.error).toString());
  }
  return parseResult.data;
}
