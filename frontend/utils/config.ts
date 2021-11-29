//TODO assert required environment variables are defined

const config = {
    url: {
        api: process.env.NEXT_PUBLIC_API_BASE_URL,
        rpc: {
            mainnet: process.env.NEXT_PUBLIC_MAIN_NET_RPC,
            testnet: process.env.NEXT_PUBLIC_TEST_NET_RPC,
        }
    },
    buttonDebounce: process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE ? parseInt(process.env.NEXT_PUBLIC_BUTTON_DEBOUNCE) : undefined
}

export default config;