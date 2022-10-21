import type { AbiRoot, AnyContract } from 'near-abi-client-js';
import { Contract as NearContract } from 'near-abi-client-js';
import { connect, keyStores } from 'near-api-js';
import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import analytics from '@/utils/analytics';
import config from '@/utils/config';
import { authenticatedPost } from '@/utils/http';
import type { Contract, NetOption } from '@/utils/types';

import { inspectContract } from '../utils/embedded-abi';

const RPC_API_ENDPOINT = config.url.rpc.default.TESTNET;

interface AbiResponse {
  contractSlug: string;
  abi: AbiRoot;
}

// Prefers an embedded ABI in the wasm, if there is one, else returns any manually uploaded ABI.
export const useAnyAbi = (contract: Contract | undefined) => {
  const { embeddedAbi } = useEmbeddedAbi(contract?.net, contract?.address);
  const { contractAbi, error } = useContractAbi(contract?.slug);

  // We haven't determined if there is an embedded ABI yet, so let's return nothing for now.
  if (embeddedAbi === undefined) {
    return { contractAbi: null };
  }

  // There is an embedded ABI in the wasm.
  if (embeddedAbi !== null) {
    return { contractAbi: embeddedAbi, embedded: true };
  }

  // There is no embedded ABI.
  return { contractAbi, error };
};

export const useEmbeddedAbi = (net: NetOption | undefined, address: string | undefined) => {
  const {
    data: embeddedAbi,
    error,
    mutate,
  } = useSWR<AbiRoot | null | undefined>(net && address ? [net, address] : null, (net, address) => {
    return inspectContract(net, address);
  });
  return { embeddedAbi, error, mutate };
};

export const useContractAbi = (contract: string | undefined) => {
  const { identity } = useIdentity();
  const {
    data: contractAbi,
    error,
    mutate,
  } = useSWR<AbiResponse>(
    identity && contract ? ['/abi/getContractAbi', contract, identity.uid] : null,
    (key, contract) => {
      return authenticatedPost(key, { contract });
    },
  );

  return { contractAbi: contractAbi?.abi, error, mutate };
};

export const uploadContractAbi = async (contractSlug: string, abi: AbiRoot) => {
  try {
    await authenticatedPost('/abi/addContractAbi', {
      contract: contractSlug,
      abi,
    });

    analytics.track('DC Upload Contract ABI', {
      status: 'success',
      contract: contractSlug,
    });

    return true;
  } catch (e: any) {
    console.error(e);

    analytics.track('DC Upload Contract ABI', {
      status: 'failure',
      contract: contractSlug,
      error: e.message,
    });

    return false;
  }
};

export const initContractMethods = async (
  networkId: string,
  contractId: string,
  abi: AbiRoot,
): Promise<AnyContract> => {
  const keyStore = new keyStores.InMemoryKeyStore();
  const config = {
    networkId,
    // TODO this should be updated based on the network
    nodeUrl: RPC_API_ENDPOINT,
    headers: {},
    deps: {
      // TODO this shouldn't be needed. Likely this type should change
      keyStore,
    },
  };
  const near = await connect(config);
  const contract = new NearContract(near.connection, contractId, abi);
  return contract;
};
