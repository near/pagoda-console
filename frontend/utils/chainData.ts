import * as nearAPI from "near-api-js";
import useSWR from "swr";

const RPC_API_ENDPOINT = 'https://rpc.testnet.near.org'; // TODO
const ACCOUNT_ID = 'michaelpeter.testnet'; // TODO

let near: nearAPI.Near;

export interface ContractMetadata {
    spec?: string, // required, essentially a version like "nft-1.0.0"
    name?: string, // required, ex. "Mochi Rising — Digital Edition" or "Metaverse 3"
    symbol?: string, // required, ex. "MOCHI"
    icon?: string | null, // Data URL
    base_uri?: string | null, // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
    reference?: string | null, // URL to a JSON file with more info
    reference_hash?: string | null, // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

export interface NftData {
    errors: {
        metadata: boolean,
        supply: boolean,
        tokenJson: boolean,
    }
    metadata?: ContractMetadata,
    supply?: number,
    tokenJson?: any,
}

export interface Token {
    token_id?: string,
    owner_id?: string,
    metadata?: TokenMetadata
}
// pulled directly from https://nomicon.io/Standards/NonFungibleToken/Metadata
// all properties made optional to cover potential non-compliance with spec
export interface TokenMetadata {
    title?: string | null, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    description?: string | null, // free-form description
    media?: string | null, // URL to associated media, preferably to decentralized, content-addressed storage
    media_hash?: string | null, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    copies?: number | null, // number of copies of this set of metadata in existence when token was minted.
    issued_at?: number | null, // When token was issued or minted, Unix epoch in milliseconds
    expires_at?: number | null, // When token expires, Unix epoch in milliseconds
    starts_at?: number | null, // When token starts being valid, Unix epoch in milliseconds
    updated_at?: number | null, // When token was last updated, Unix epoch in milliseconds
    extra?: string | null, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    reference?: string | null, // URL to an off-chain JSON file with more info.
    reference_hash?: string | null // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

const nftMetaFetcher = async (_: any, contractAddress: any) => {
    // have to cast contract to any so that we can call the dynamically generated methods on it
    const contract = new nearAPI.Contract(
        await near.account('michaelpeter.testnet'), // the account object that is connecting
        contractAddress,
        {
            // name of contract you're connecting to
            viewMethods: ["nft_total_supply", "nft_tokens", "nft_metadata"], // view methods do not change state but usually return a value
            changeMethods: [], // change methods modify state
            //   sender: account, // account object to initialize and sign transactions.
        }
    ) as any;
    // return await contract.nft_metadata();


    let nftData: NftData = {
        errors: {
            metadata: false,
            supply: false,
            tokenJson: false,
        }
    };

    try {
        nftData.metadata = await contract.nft_metadata();
    } catch (e) {
        // TODO exit here, maybe return. It is likely this is not an NFT contract if this function fails
        nftData.errors.metadata = true;
        return nftData;
    }

    if (!nftData.metadata?.spec || !/^nft-\d+\.\d+\.\d+$/.test(nftData.metadata.spec)) {
        // contract does not have appropriate metadata stating that it conforms to nft spec. skip further calls
        return nftData;
    }


    type FetchPromise = [keyof NftData['errors'], Promise<any>];

    // kick off both promises so they can be fetched in parallel
    let dataPromises: FetchPromise[] = [
        ['supply', contract.nft_total_supply()],
        ['tokenJson', contract.nft_tokens({ limit: 30 })],
    ];

    for (let [key, promise] of dataPromises) {
        try {
            nftData[key] = await promise;
        } catch (e) {
            nftData.errors[key] = true; // TODO expose error?
            console.error(e); // TODO do not log
        }
    }

    return nftData;
}

export async function initializeNaj() {
    if (near) {
        return;
    }
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const nearConfig = {
        networkId: 'testnet',
        keyStore,
        nodeUrl: RPC_API_ENDPOINT,
        headers: {},
    };

    near = await nearAPI.connect(nearConfig);
}

export function useContractInfo(contractAddress: string | null) {
    return useSWR(contractAddress ? ['state', contractAddress] : null, async (_, address: string) => {
        // const e = new Error('original'); // TODO test error causes
        // throw new Error('Custom', { cause: e });
        return (await near.account(address)).state();
    });
}

export function useMetadata(contractType: 'NFT' | 'FT', contractAddress: string | null) {
    if (contractType === 'FT') {
        throw new Error('FT not yet supported');
    }
    return useSWR(contractAddress ? ['nftData', contractAddress] : null, nftMetaFetcher, {
        refreshInterval: 3000
    });
}

export function isNajInitialized() {
    return Boolean(near);
}