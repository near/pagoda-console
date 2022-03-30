import * as nearAPI from 'near-api-js';
import type { AccountView } from 'near-api-js/lib/providers/provider';
import useSWR from 'swr';

import Config from '../utils/config';

const RPC_API_ENDPOINT = Config.url.rpc.default.TESTNET;

let near: nearAPI.Near;

export interface ContractMetadata {
  spec?: string; // required, essentially a version like "nft-1.0.0"
  name?: string; // required, ex. "Mochi Rising — Digital Edition" or "Metaverse 3"
  symbol?: string; // required, ex. "MOCHI"
  icon?: string | null; // Data URL
  base_uri?: string | null; // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
  reference?: string | null; // URL to a JSON file with more info
  reference_hash?: string | null; // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

export interface NftData {
  errors: {
    metadata: string | null;
    supply: string | null;
    tokenJson: string | null;
  };
  metadata?: ContractMetadata;
  supply?: number;
  tokenJson?: any;
  claimsSpec: boolean;
  initialized: boolean;
}

export interface Token {
  token_id?: string;
  owner_id?: string;
  metadata?: TokenMetadata;
}
// pulled directly from https://nomicon.io/Standards/NonFungibleToken/Metadata
// all properties made optional to cover potential non-compliance with spec
export interface TokenMetadata {
  title?: string | null; // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
  description?: string | null; // free-form description
  media?: string | null; // URL to associated media, preferably to decentralized, content-addressed storage
  media_hash?: string | null; // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
  copies?: number | null; // number of copies of this set of metadata in existence when token was minted.
  issued_at?: number | null; // When token was issued or minted, Unix epoch in milliseconds
  expires_at?: number | null; // When token expires, Unix epoch in milliseconds
  starts_at?: number | null; // When token starts being valid, Unix epoch in milliseconds
  updated_at?: number | null; // When token was last updated, Unix epoch in milliseconds
  extra?: string | null; // anything extra the NFT wants to store on-chain. Can be stringified JSON.
  reference?: string | null; // URL to an off-chain JSON file with more info.
  reference_hash?: string | null; // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

const nftMetaFetcher = async (_: any, contractAddress: any) => {
  // have to cast contract to any so that we can call the dynamically generated methods on it
  const contract = new nearAPI.Contract(
    await near.account(''), // the account object that is connecting. None for now
    contractAddress,
    {
      // name of contract you're connecting to
      viewMethods: ['nft_total_supply', 'nft_tokens', 'nft_metadata'], // view methods do not change state but usually return a value
      changeMethods: [], // change methods modify state
      //   sender: account, // account object to initialize and sign transactions.
    },
  ) as any;
  // return await contract.nft_metadata();

  const nftData: NftData = {
    errors: {
      metadata: null,
      supply: null,
      tokenJson: null,
    },
    claimsSpec: false,
    initialized: false,
  };

  try {
    nftData.metadata = await contract.nft_metadata();
  } catch (e: any) {
    if (typeof e.message === 'string' && (e.message as string).includes('MethodNotFound')) {
      nftData.errors.metadata = 'METHOD_NOT_IMPLEMENTED';
    } else if (typeof e.message === 'string' && (e.message as string).includes('contract is not initialized')) {
      nftData.errors.metadata = 'CONTRACT_NOT_INITIALIZED';
    } else {
      // generic error for now
      throw new Error('metadata');
    }
    return nftData;
  }

  // successfully requested metadata, contract must be initialized
  nftData.initialized = true;

  if (!nftData.metadata?.spec || !/^nft-\d+\.\d+\.\d+$/.test(nftData.metadata.spec)) {
    // contract does not have appropriate metadata stating that it conforms to nft spec. skip further calls
    return nftData;
  }

  // contract claims to conform to NFT spec
  nftData.claimsSpec = true;

  // this section could likely be cleaned up
  type dataKeys = keyof NftData['errors'];
  const dataNames: dataKeys[] = ['supply', 'tokenJson'];
  // TODO extract limit to environment variable
  const dataFetches = [contract.nft_total_supply(), contract.nft_tokens({ limit: 30 })];

  const fetchResults = await Promise.allSettled(dataFetches);

  for (let i = 0; i < fetchResults.length; i++) {
    // create direct ref to result to make typescript happy
    const currentResult = fetchResults[i];
    if (currentResult.status === 'fulfilled' && currentResult.value) {
      nftData[dataNames[i]] = currentResult.value;
    } else if (currentResult.status === 'fulfilled') {
      // TODO review this in depth. Is this always valid?
      // fulfilled but no value. Assume not implemented
      nftData.errors[dataNames[i]] = 'METHOD_NOT_IMPLEMENTED';
    } else if (
      typeof currentResult.reason.message === 'string' &&
      currentResult.reason.message.includes('MethodNotFound')
    ) {
      console.error(currentResult.reason);
      nftData.errors[dataNames[i]] = 'METHOD_NOT_IMPLEMENTED';
    } else {
      // unexpected error. We throw even if only one call failed like this because
      // handling errors for each fetch seperately was adding a lot of undue complexity
      // to the UI
      throw new Error(dataNames[i]);
    }
  }

  if (typeof nftData.supply === 'string') {
    nftData.supply = parseInt(nftData.supply);
  }

  return nftData;
};

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

type ContractInfo = Partial<AccountView> & { codeDeployed?: boolean; accountExists?: boolean };
export function useContractInfo(contractAddress: string | null) {
  return useSWR(
    contractAddress ? ['state', contractAddress] : null,
    async (_, address: string) => {
      let contractInfo: ContractInfo;
      try {
        const account = await near.account(address);
        contractInfo = await account.state();
      } catch (e: any) {
        if (e?.type === 'AccountDoesNotExist') {
          return { accountExists: false };
        }
        throw e;
      }

      contractInfo.accountExists = true;
      contractInfo.codeDeployed = Boolean(
        contractInfo.code_hash && contractInfo.code_hash !== '11111111111111111111111111111111',
      );
      return contractInfo;
    },
    {
      // TODO extract to environment variable
      refreshInterval: 3000,
    },
  );
}

export function useMetadata(contractType: 'NFT' | 'FT', contractAddress: string | null) {
  if (contractType === 'FT') {
    throw new Error('FT not yet supported');
  }
  return useSWR(contractAddress ? ['nftData', contractAddress] : null, nftMetaFetcher, {
    // TODO extract to environment variable
    refreshInterval: 3000,
  });
}

export function isNajInitialized() {
  return Boolean(near);
}
