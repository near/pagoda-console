import { FirebaseOptions } from "firebase/app";
import { NetOption } from "./interfaces";

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

type RpcNets = Record<NetOption, string>;

interface AppConfig {
    url: {
        api: string,
        rpc: {
            default: RpcNets,
            archival: RpcNets;
            recommended: RpcNets;
        };
    },
    buttonDebounce: number,
    usagePersistenceMinutes: number,
    mixpanel: {
        token: string,
        debug: boolean
    },
    firebaseConfig: FirebaseOptions
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
        }
    },
    buttonDebounce: parseInt(process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE),
    usagePersistenceMinutes: parseInt(process.env.NEXT_PUBLIC_USAGE_PERSISTENCE_MINUTES),
    mixpanel: {
        token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
        debug: process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === 'true',
    },
    firebaseConfig: JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
};

export default config;