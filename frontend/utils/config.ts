import { NetOption } from "./interfaces";

if (
    !process.env.NEXT_PUBLIC_API_BASE_URL ||
    !process.env.NEXT_PUBLIC_MAIN_NET_RPC ||
    !process.env.NEXT_PUBLIC_TEST_NET_RPC ||
    !process.env.NEXT_PUBLIC_MAIN_NET_ARCHIVAL_RPC ||
    !process.env.NEXT_PUBLIC_TEST_NET_ARCHIVAL_RPC ||
    !process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE
) {
    throw new Error('Missing configuration value');
}

type RpcNets = Record<NetOption, string>

interface AppConfig {
    url : {
        api: string,
        rpc: {
            default: RpcNets,
            archival: RpcNets
        }
    },
    buttonDebounce: number
}

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
            }
        }
    },
    buttonDebounce: parseInt(process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE)
}

export default config;