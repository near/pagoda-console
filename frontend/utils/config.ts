import type { FirebaseOptions } from 'firebase/app';

import type { NetOption } from './types';

type ExplorerNets = Record<NetOption, string>;
type RpcNets = Record<NetOption, string>;
type EapiNets = Record<NetOption, string>;
type DeployEnvironment = 'LOCAL' | 'DEVELOPMENT' | 'PRODUCTION';

// * NOTE: This is ugly, but we are limited in how we can
// * implement this check. Due to the way Next.js loads
// * environment variables, we cannot access the variables
// * with object destructuring. We also need to explicitly
// * check each variable to make TypeScript happy further
// * down, or add non-null assertion on every usage.
// * https://nextjs.org/docs/basic-features/environment-variables#loading-environment-variables
if (
  !process.env.NEXT_PUBLIC_API_BASE_URL ||
  !process.env.NEXT_PUBLIC_MAIN_NET_RPC ||
  !process.env.NEXT_PUBLIC_TEST_NET_RPC ||
  !process.env.NEXT_PUBLIC_MAIN_NET_ARCHIVAL_RPC ||
  !process.env.NEXT_PUBLIC_TEST_NET_ARCHIVAL_RPC ||
  !process.env.NEXT_PUBLIC_RECOMMENDED_MAIN_NET_RPC ||
  !process.env.NEXT_PUBLIC_RECOMMENDED_TEST_NET_RPC ||
  !process.env.NEXT_PUBLIC_EAPI_MAINNET_URL ||
  !process.env.NEXT_PUBLIC_EAPI_TESTNET_URL ||
  !process.env.NEXT_PUBLIC_EAPI_SPEC_MAINNET_URL ||
  !process.env.NEXT_PUBLIC_EAPI_SPEC_TESTNET_URL ||
  !process.env.NEXT_PUBLIC_MAIN_NET_EXPLORER ||
  !process.env.NEXT_PUBLIC_TEST_NET_EXPLORER ||
  !process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE ||
  !process.env.NEXT_PUBLIC_USAGE_PERSISTENCE_MINUTES ||
  !process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ||
  !process.env.NEXT_PUBLIC_FIREBASE_CONFIG ||
  !process.env.NEXT_PUBLIC_DEPLOY_ENV ||
  !process.env.NEXT_PUBLIC_LAUNCHDARKLY_SDK_ENV ||
  !process.env.NEXT_PUBLIC_ANALYTICS_MAIN_NET_IFRAME ||
  !process.env.NEXT_PUBLIC_ANALYTICS_TEST_NET_IFRAME
) {
  throw new Error('Missing configuration value');
}

// Validate downtime related variables:

const downtimeMessage = process.env.NEXT_PUBLIC_DOWNTIME_MESSAGE || '';
const downtimeModeRaw = process.env.NEXT_PUBLIC_DOWNTIME_MODE;
const downtimeModes = ['maintenance', 'unexpected', 'custom'] as const;
type DowntimeMode = typeof downtimeModes[number];
let downtimeMode: DowntimeMode | undefined = undefined;

if (downtimeModeRaw) {
  const value = downtimeModeRaw as DowntimeMode;
  if (!downtimeModes.includes(value)) throw new Error(`Invalid value for NEXT_PUBLIC_DOWNTIME_MODE: "${value}"`);
  downtimeMode = value;
}

if (downtimeMode === 'custom' && !downtimeMessage) {
  throw new Error(
    `Invalid value for NEXT_PUBLIC_DOWNTIME_MESSAGE: "${downtimeMessage}" (should be non-empty string due to NEXT_PUBLIC_DOWNTIME_MODE="custom")`,
  );
}

// Telegram config:

if (process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'LOCAL' && !process.env.NEXT_PUBLIC_TELEGRAM_BOT_HANDLE) {
  throw new Error(`Missing required value for NEXT_PUBLIC_TELEGRAM_BOT_HANDLE.`);
}

// Define config:
interface AppConfig {
  url: {
    api: string;
    explorer: ExplorerNets;
    rpc: {
      default: RpcNets;
      archival: RpcNets;
      recommended: RpcNets;
    };
    eapi: EapiNets;
    eapiSpec: EapiNets;
  };
  buttonDebounce: number;
  usagePersistenceMinutes: number;
  segment: string;
  firebaseConfig: FirebaseOptions;
  downtimeMessage: string;
  downtimeMode: DowntimeMode | undefined;
  deployEnv: DeployEnvironment;
  telegramBotHandle?: string;
  defaultPageSize: number;
  defaultLiveDataRefreshIntervalMs: number;
  analyticsIframeUrl: RpcNets;
  launchDarklyEnv: string;
  gleapAuth?: string;
}

// TODO remove recommended RPC since there is no longer a separate URL from default
const config: AppConfig = {
  url: {
    api: process.env.NEXT_PUBLIC_API_BASE_URL,
    explorer: {
      MAINNET: process.env.NEXT_PUBLIC_MAIN_NET_EXPLORER,
      TESTNET: process.env.NEXT_PUBLIC_TEST_NET_EXPLORER,
    },
    rpc: {
      default: {
        MAINNET: process.env.NEXT_PUBLIC_MAIN_NET_RPC,
        TESTNET: process.env.NEXT_PUBLIC_TEST_NET_RPC,
      },
      archival: {
        MAINNET: process.env.NEXT_PUBLIC_MAIN_NET_ARCHIVAL_RPC,
        TESTNET: process.env.NEXT_PUBLIC_TEST_NET_ARCHIVAL_RPC,
      },
      recommended: {
        MAINNET: process.env.NEXT_PUBLIC_RECOMMENDED_MAIN_NET_RPC,
        TESTNET: process.env.NEXT_PUBLIC_RECOMMENDED_TEST_NET_RPC,
      },
    },
    eapi: {
      MAINNET: process.env.NEXT_PUBLIC_EAPI_MAINNET_URL,
      TESTNET: process.env.NEXT_PUBLIC_EAPI_TESTNET_URL,
    },
    eapiSpec: {
      MAINNET: process.env.NEXT_PUBLIC_EAPI_SPEC_MAINNET_URL,
      TESTNET: process.env.NEXT_PUBLIC_EAPI_SPEC_TESTNET_URL,
    },
  },
  buttonDebounce: parseInt(process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE),
  usagePersistenceMinutes: parseInt(process.env.NEXT_PUBLIC_USAGE_PERSISTENCE_MINUTES),
  segment: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
  firebaseConfig: JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG),
  downtimeMessage,
  downtimeMode,
  deployEnv: ['LOCAL', 'DEVELOPMENT', 'PRODUCTION'].includes(process.env.NEXT_PUBLIC_DEPLOY_ENV)
    ? (process.env.NEXT_PUBLIC_DEPLOY_ENV as DeployEnvironment)
    : 'PRODUCTION', // default to production to be safe
  telegramBotHandle: process.env.NEXT_PUBLIC_TELEGRAM_BOT_HANDLE,
  defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '100'),
  defaultLiveDataRefreshIntervalMs: parseInt(process.env.NEXT_PUBLIC_DEFAULT_LIVE_DATA_REFRESH_INTERVAL_MS || '3000'),
  analyticsIframeUrl: {
    MAINNET: process.env.NEXT_PUBLIC_ANALYTICS_MAIN_NET_IFRAME,
    TESTNET: process.env.NEXT_PUBLIC_ANALYTICS_TEST_NET_IFRAME,
  },
  launchDarklyEnv: process.env.NEXT_PUBLIC_LAUNCHDARKLY_SDK_ENV,
  gleapAuth: process.env.NEXT_PUBLIC_GLEAP_AUTH_KEY,
};

export default config;
