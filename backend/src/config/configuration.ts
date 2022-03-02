import { Net } from '@prisma/client';
import Joi from 'joi';
import VError from 'verror';

const envSchema = Joi.object({
  port: Joi.number().integer(),
  deployEnv: Joi.string().valid(
    'LOCAL',
    'DEVELOPMENT',
    'STAGING',
    'PRODUCTION',
  ),
});

// check that all required config values are present
// const requiredConfig = [
//   'PORT',
//   'FIREBASE_CREDENTIALS',
//   'DATABASE_URL',
//   'KEY_MANAGEMENT_URL_TEST',
//   'KEY_MANAGEMENT_CREDENTIALS_TEST',
//   'KEY_MANAGEMENT_QUOTA_TEST',
//   'KEY_MANAGEMENT_URL_MAIN',
//   'KEY_MANAGEMENT_CREDENTIALS_MAIN',
//   'KEY_MANAGEMENT_QUOTA_MAIN',
//   'RECENT_TRANSACTIONS_COUNT',
//   'MIXPANEL_API',
//   'DEPLOY_ENV',
// ];

// const missingConfigs = [];
// for (const cfgKey of requiredConfig) {
//   if (!process.env[cfgKey]) {
//     missingConfigs.push(cfgKey);
//   }
// }
// if (missingConfigs.length) {
//   throw new VError(
//     `Missing required config values: ${missingConfigs.join(', ')}`,
//   );
// }

type DeployEnv = 'LOCAL' | 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

interface AppConfig {
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
  };
  firebase: {
    credentials: string;
  };
  dev: {
    mock: {
      rpcAuth: boolean;
    };
  };
}

// export default () => ({
//   port: parseInt(process.env.PORT, 10) || 3000,
//   database: {
//     host: process.env.DATABASE_HOST,
//     port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
//   },
// });

export default function (): AppConfig {
  // if (
  //   !['LOCAL', 'DEVELOPMENT', 'STAGING', 'PRODUCTION'].includes(
  //     process.env.DEPLOY_ENV,
  //   )
  // ) {
  //   throw new VError('Invalid deployment env provided');
  // }
  // return {
  //   deployEnv: process.env.DEPLOY_ENV as DeployEnv,
  //   port: intOrThrow('PORT'),
  //   db: {
  //     connectionString: process.env.DATABASE_URL,
  //   },
  //   rpcAuth: {
  //     TESTNET: {
  //       url: process.env.KEY_MANAGEMENT_URL_TEST,
  //       credential: process.env.KEY_MANAGEMENT_CREDENTIALS_TEST,
  //       quota: intOrThrow('KEY_MANAGEMENT_QUOTA_TEST'),
  //     },
  //   },
  //   recentTransactionsCount: intOrThrow('RECENT_TRANSACTIONS_COUNT'),
  //   projectRefPrefix: process.env.PROJECT_REF_PREFIX || '',
  //   analytics: {
  //     url: process.env.MIXPANEL_API,
  //   },
  //   firebase: {
  //     credentials: process.env.FIREBASE_CREDENTIALS,
  //   },
  //   dev: {
  //     mock: {
  //       rpcAuth: Boolean(process.env.MOCK_KEY_SERVICE),
  //     },
  //   },
  // };

  const provided = {
    port: process.env.PORT,
    deployEnv: process.env.DEPLOY_ENV,
  };

  // const validated = envSchema.validate(provided);
  // return validated;
  const ab: AppConfig = Joi.attempt(provided, envSchema);
}

// attempts to retrieve an integer value from environment variables, and
// throws if it is not a valid int
function intOrThrow(envKey: string): number {
  const tryNum = parseInt(process.env[envKey]);
  if (Number.isNaN(tryNum)) {
    throw new VError(`process.env.${envKey} is not a valid integer`);
  }
  return tryNum;
}
