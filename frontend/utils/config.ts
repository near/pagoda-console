//TODO assert required environment variables are defined
if (
    !process.env.NEXT_PUBLIC_API_BASE_URL ||
    !process.env.NEXT_PUBLIC_MAIN_NET_RPC ||
    !process.env.NEXT_PUBLIC_TEST_NET_RPC ||
    !process.env.NEXT_PUBLIC_TEST_NET_ARCHIVAL_RPC ||
    !process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE
) {
    throw new Error('Missing configuration value');
}

const config = {
    url: {
        api: process.env.NEXT_PUBLIC_API_BASE_URL,
        rpc: {
            mainnet: process.env.NEXT_PUBLIC_MAIN_NET_RPC,
            testnet: process.env.NEXT_PUBLIC_TEST_NET_RPC,
            testnetArchival: process.env.NEXT_PUBLIC_TEST_NET_ARCHIVAL_RPC,
        }
    },
    buttonDebounce: process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE ? parseInt(process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE) : undefined
}

export default config;