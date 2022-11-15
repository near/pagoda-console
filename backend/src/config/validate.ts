import { Net } from '@pc/database/clients/core';
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
  nearRpc: Record<Net, { url: string }>;
  nearArchivalRpc: Record<Net, { url: string }>;
  recentTransactionsCount: number;
  projectRefPrefix: string;
  indexerDatabase: Record<Net, Database>;
  indexerActivityDatabase: Partial<Record<Net, Database>>;
  firebase: {
    credentials: string;
    clientConfig: string;
  };
  log: {
    queries: boolean;
    indexer: boolean;
  };
  orgs: {
    inviteTokenExpiryMinutes: number;
  };
  alerts: {
    email: {
      tokenExpiryMin: number;
      resendVerificationRatelimitMillis: number;
    };
    telegram?: {
      tokenExpiryMin: number;
      botToken?: string;
      secret?: string;
    };
  };
  mailgun: {
    domain: string;
    apiKey: string;
  };
  email: {
    mock: boolean;
    noReply: string;
    alerts: {
      noReply: string;
    };
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
  metricsPort: string;
  rpcProvisioningService: {
    mock: boolean;
    apiKey: string;
    url: string;
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
  nearArchivalRpc: {
    TESTNET: {
      url: Joi.string()
        .uri({ scheme: 'https' })
        .optional()
        .default('https://archival-rpc.testnet.near.org'),
    },
    MAINNET: Joi.object({
      url: Joi.string()
        .uri({ scheme: 'https' })
        .optional()
        .default('https://archival-rpc.mainnet.near.org'),
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
  firebase: {
    credentials: Joi.string(),
    clientConfig: Joi.string(),
  },
  log: {
    queries: Joi.boolean().optional().default(false),
    indexer: Joi.boolean().optional().default(false),
  },
  orgs: {
    inviteTokenExpiryMinutes: Joi.number().optional().default(10000), // TODO set to a small value once requesting a new token is possible
  },
  alerts: {
    email: Joi.object({
      tokenExpiryMin: Joi.number().optional().default(10000), // TODO set to a small value once requesting a new token is possible
      resendVerificationRatelimitMillis: Joi.number().optional().default(2000),
    }),
    telegram: Joi.object({
      tokenExpiryMin: Joi.number().optional().default(10000), // TODO set to a small value once requesting a new token is possible
      botToken: Joi.string().when('/alerts.telegram.enableWebhook', {
        is: Joi.boolean().valid(false),
        then: Joi.optional().allow(''),
      }),
      secret: Joi.string().when('/alerts.telegram.enableWebhook', {
        is: Joi.boolean().valid(false),
        then: Joi.optional().allow(''),
      }),
    }).optional(),
  },
  mailgun: {
    domain: Joi.string(),
    apiKey: Joi.string(),
  },
  email: {
    mock: Joi.boolean().optional().default(false),
    noReply: Joi.string(),
    alerts: {
      noReply: Joi.string(),
    },
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
  metricsPort: Joi.number().optional().default(3030),
  rpcProvisioningService: {
    mock: Joi.boolean().optional().default(false),
    url: Joi.string()
      .uri({ scheme: 'http' })
      .when('/dev.mock.rpcProvisioningService', {
        // the slash accesses off the schema root
        is: Joi.boolean().valid(true),
        then: Joi.optional().allow(''),
      }),
    apiKey: Joi.string().when('/dev.mock.rpcProvisioningService', {
      is: Joi.boolean().valid(true),
      then: Joi.optional().allow(''),
    }),
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
    nearRpc: {
      TESTNET: {
        url: config.NEAR_RPC_URL_TEST,
      },
      MAINNET: {
        url: config.NEAR_RPC_URL_MAIN,
      },
    },
    nearArchivalRpc: {
      TESTNET: {
        url: config.NEAR_ARCHIVAL_RPC_URL_TEST,
      },
      MAINNET: {
        url: config.NEAR_ARCHIVAL_RPC_URL_MAIN,
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
    firebase: {
      credentials: config.FIREBASE_CREDENTIALS,
      clientConfig: config.FIREBASE_CLIENT_CONFIG,
    },
    log: {
      queries: config.LOG_QUERIES,
      indexer: config.LOG_INDEXER,
    },
    orgs: {
      inviteTokenExpiryMinutes: config.ORGS_INVITE_TOKEN_EXPIRY_MINUTES,
    },
    alerts: {
      email: {
        tokenExpiryMin: config.EMAIL_TOKEN_EXPIRY_MIN,
        resendVerificationRatelimitMillis:
          config.RESEND_VERIFICATION_RATE_LIMIT_MILLIS,
      },
      telegram: config.TELEGRAM_ENABLE_WEBHOOK
        ? {
            tokenExpiryMin: config.TELEGRAM_TOKEN_EXPIRY_MIN,
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
      mock: config.MOCK_EMAIL_SERVICE,
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
    rpcProvisioningService: {
      mock: Boolean(config.MOCK_KEY_SERVICE),
      url: config.RPC_API_KEYS_URL,
      apiKey: config.RPC_API_KEYS_API_KEY,
    },
  };

  // Joi.attempt will return the validated object with values
  // cast to their proper types or throw an error if validation
  // fails
  try {
    const validatedConfig: AppConfig = Joi.attempt(
      structuredConfig,
      appConfigSchema,
      {
        presence: 'required',
      },
    );
    return validatedConfig;
  } catch (e: any) {
    if (e.details) {
      // very simplistic error formatic since we are replacing Joi soon anyways
      throw new Error(JSON.stringify(e.details));
    }
    throw e;
  }
}
