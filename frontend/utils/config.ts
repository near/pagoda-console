import type { FirebaseOptions } from 'firebase/app';

import type { NetOption } from './interfaces';

type RpcNets = Record<NetOption, string>;

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
  !process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE ||
  !process.env.NEXT_PUBLIC_USAGE_PERSISTENCE_MINUTES ||
  !process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ||
  !process.env.NEXT_PUBLIC_FIREBASE_CONFIG
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

// Define config:

interface AppConfig {
  url: {
    api: string;
    rpc: {
      default: RpcNets;
      archival: RpcNets;
      recommended: RpcNets;
    };
  };
  buttonDebounce: number;
  usagePersistenceMinutes: number;
  mixpanel: {
    token: string;
    debug: boolean;
  };
  firebaseConfig: FirebaseOptions;
  downtimeMessage: string;
  downtimeMode: DowntimeMode | undefined;
}

// TODO remove recommended RPC since there is no longer a separate URL from default
const config: AppConfig = {
  url: {
    api: process.env.NEXT_PUBLIC_API_BASE_URL,
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
  },
  buttonDebounce: parseInt(process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE),
  usagePersistenceMinutes: parseInt(process.env.NEXT_PUBLIC_USAGE_PERSISTENCE_MINUTES),
  mixpanel: {
    token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    debug: process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === 'true',
  },
  firebaseConfig: JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG),
  downtimeMessage,
  downtimeMode,
};

export default config;
