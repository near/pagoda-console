import { Net } from '../../generated/prisma/core';
import * as Joi from 'joi';

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

// when using Joi, we must maintain a TypeScript interface alongside
// it and ensure they stay in sync. Joi will perform runtime validation
// and casting but cannot provide compile-time types

export type Database = {
  host: string;
  database: string;
  user: string;
  password: string;
};

type DeployEnv = 'LOCAL' | 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
export interface AppConfig {
  deployEnv: DeployEnv;
  port: number;
  db: {
    connectionString: string;
  };
  rpcAuth: Record<Net, { url: string; credential: string; quota: number }>;
  nearRpc: Record<Net, { url: string }>;
  recentTransactionsCount: number;
  projectRefPrefix: string;
  indexerDatabase: Record<Net, Database>;
  indexerActivityDatabase: Partial<Record<Net, Database>>;
  analytics: {
    url: string;
    token: string;
  };
  firebase: {
    credentials: string;
  };
  dev: {
    mock: {
      rpcAuth: boolean;
      rpcAuthErrors: boolean;
    };
  };
  log: {
    queries: boolean;
    indexer: boolean;
  };
  alerts: {
    emailTokenExpiryMin: number;
    telegram: {
      tokenExpiryMin: number;
      enableWebhook: boolean;
      botToken?: string;
      secret?: string;
    };
  };
  mailgun: {
    domain: string;
    username: string;
    apiKey: string;
  };
  email: {
    emailVerificationFrom: string;
    emailVerificationSubject: string;
  };
  frontend: {
    baseUrl: string;
  };
  featureEnabled: {
    core: {
      contractAddressValidation: boolean;
    };
    alerts: {
      contractAddressValidation: boolean;
    };
  };
}

const databaseSchema = Joi.object({
  host: Joi.string(),
  database: Joi.string(),
  user: Joi.string(),
  password: Joi.string(),
});

// Joi docs: https://joi.dev/api
// * When validation is performed, a default option is changed to
// * require all properties to exist. If you are adding an optional
// * environment variable, you must add `.optional()` to its Joi
// * definition
const appConfigSchema = Joi.object({
  deployEnv: Joi.string().valid(
    'LOCAL',
    'DEVELOPMENT',
    'STAGING',
    'PRODUCTION',
  ),
  port: Joi.number().integer(),
  db: {
    connectionString: Joi.string(),
  },
  rpcAuth: {
    TESTNET: {
      url: Joi.string()
        .uri({ scheme: 'https' })
        .when('/dev.mock.rpcAuth', {
          // the slash accesses off the schema root
          is: Joi.boolean().valid(true),
          then: Joi.optional().allow(''),
        }),
      credential: Joi.string().when('/dev.mock.rpcAuth', {
        is: Joi.boolean().valid(true),
        then: Joi.optional().allow(''),
      }),
      quota: Joi.number().integer(),
    },
    MAINNET: Joi.object({
      url: Joi.string()
        .uri({ scheme: 'https' })
        .when('/dev.mock.rpcAuth', {
          is: Joi.boolean().valid(true),
          then: Joi.optional().allow(''),
        }),
      credential: Joi.string().when('/dev.mock.rpcAuth', {
        is: Joi.boolean().valid(true),
        then: Joi.optional().allow(''),
      }),
      quota: Joi.number().integer(),
    }),
  },
  nearRpc: {
    TESTNET: {
      url: Joi.string()
        .uri({ scheme: 'https' })
        .optional()
        .default('https://rpc.testnet.near.org'),
    },
    MAINNET: Joi.object({
      url: Joi.string()
        .uri({ scheme: 'https' })
        .optional()
        .default('https://rpc.mainnet.near.org'),
    }),
  },
  indexerDatabase: Joi.object({
    MAINNET: databaseSchema,
    TESTNET: databaseSchema,
  }),
  indexerActivityDatabase: Joi.object({
    MAINNET: databaseSchema,
    TESTNET: databaseSchema.optional(),
  }),
  recentTransactionsCount: Joi.number().integer(),
  projectRefPrefix: Joi.string().optional().default(''),
  analytics: {
    url: Joi.string().uri({ scheme: 'https' }),
    token: Joi.string(),
  },
  firebase: {
    credentials: Joi.string(),
  },
  dev: {
    mock: {
      rpcAuth: Joi.boolean().optional().default(false),
      rpcAuthErrors: Joi.boolean().optional().default(false),
    },
  },
  log: {
    queries: Joi.boolean().optional().default(false),
    indexer: Joi.boolean().optional().default(false),
  },
  alerts: {
    emailTokenExpiryMin: Joi.number().optional().default(10000), // TODO set to a small value once requesting a new token is possible
    telegram: Joi.object({
      tokenExpiryMin: Joi.number().optional().default(10000), // TODO set to a small value once requesting a new token is possible
      enableWebhook: Joi.boolean().optional().default(false),
      botToken: Joi.string().when('/alerts.telegram.enableWebhook', {
        is: Joi.boolean().valid(false),
        then: Joi.optional().allow(''),
      }),
      secret: Joi.string().when('/alerts.telegram.enableWebhook', {
        is: Joi.boolean().valid(false),
        then: Joi.optional().allow(''),
      }),
    }),
  },
  mailgun: {
    domain: Joi.string(),
    username: Joi.string(),
    apiKey: Joi.string(),
  },
  email: {
    emailVerificationFrom: Joi.string(),
    emailVerificationSubject: Joi.string(),
  },
  frontend: {
    baseUrl: Joi.string(),
  },
  featureEnabled: {
    core: {
      contractAddressValidation: Joi.boolean().optional().default(true),
    },
    alerts: {
      contractAddressValidation: Joi.boolean().optional().default(true),
    },
  },
});

export default function validate(config: Record<string, unknown>): AppConfig {
  // read environment variables into structured object for
  // more organized access
  const structuredConfig = {
    deployEnv: config.DEPLOY_ENV as DeployEnv,
    port: config.PORT,
    db: {
      connectionString: config.DATABASE_URL,
    },
    rpcAuth: {
      TESTNET: {
        url: config.KEY_MANAGEMENT_URL_TEST,
        credential: config.KEY_MANAGEMENT_CREDENTIALS_TEST,
        quota: config.KEY_MANAGEMENT_QUOTA_TEST,
      },
      MAINNET: {
        url: config.KEY_MANAGEMENT_URL_MAIN,
        credential: config.KEY_MANAGEMENT_CREDENTIALS_MAIN,
        quota: config.KEY_MANAGEMENT_QUOTA_MAIN,
      },
    },
    nearRpc: {
      TESTNET: {
        url: config.NEAR_RPC_URL_TEST,
      },
      MAINNET: {
        url: config.NEAR_RPC_URL_MAIN,
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
    projectRefPrefix: config.PROJECT_REF_PREFIX,
    analytics: {
      url: config.MIXPANEL_API,
      token: config.MIXPANEL_TOKEN,
    },
    firebase: {
      credentials: config.FIREBASE_CREDENTIALS,
    },
    dev: {
      mock: {
        rpcAuth: config.MOCK_KEY_SERVICE,
        rpcAuthErrors: config.MOCK_KEY_SERVICE_WITH_ERRORS,
      },
    },
    log: {
      queries: config.LOG_QUERIES,
      indexer: config.LOG_INDEXER,
    },
    alerts: {
      emailTokenExpiryMin: config.EMAIL_TOKEN_EXPIRY_MIN,
      telegram: {
        tokenExpiryMin: config.TELEGRAM_TOKEN_EXPIRY_MIN,
        enableWebhook: config.TELEGRAM_ENABLE_WEBHOOK,
        botToken: config.TELEGRAM_BOT_TOKEN,
        secret: config.TELEGRAM_SECRET,
      },
    },
    mailgun: {
      domain: config.MAILGUN_DOMAIN,
      username: config.MAILGUN_USERNAME,
      apiKey: config.MAILGUN_API_KEY,
    },
    email: {
      emailVerificationFrom: config.EMAIL_VERIFICATION_FROM,
      emailVerificationSubject: config.EMAIL_VERIFICATION_SUBJECT,
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
  };

  // Joi.attempt will return the validated object with values
  // cast to their proper types or throw an error if validation
  // fails
  const validatedConfig: AppConfig = Joi.attempt(
    structuredConfig,
    appConfigSchema,
    {
      presence: 'required',
    },
  );

  return validatedConfig;
}
