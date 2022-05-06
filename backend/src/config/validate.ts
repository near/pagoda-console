import { Net } from '@prisma/client';
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

type DeployEnv = 'LOCAL' | 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
export interface AppConfig {
  deployEnv: DeployEnv;
  port: number;
  db: {
    connectionString: string;
  };
  rpcAuth: Record<Net, { url: string; credential: string; quota: number }>;
  recentTransactionsCount: number;
  projectRefPrefix: string;
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
}

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
      credential: Joi.string(),
      quota: Joi.number().integer(),
    },
    MAINNET: Joi.object({
      url: Joi.string()
        .uri({ scheme: 'https' })
        .when('/dev.mock.rpcAuth', {
          is: Joi.boolean().valid(true),
          then: Joi.optional().allow(''),
        }),
      credential: Joi.string(),
      quota: Joi.number().integer(),
    }),
  },
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
