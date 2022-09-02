import type { AbiRoot, AnyContract } from 'near-abi-client-js';
import { Contract } from 'near-abi-client-js';
import { connect, keyStores } from 'near-api-js';
import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import config from '@/utils/config';
import { authenticatedPost } from '@/utils/http';

const RPC_API_ENDPOINT = config.url.rpc.default.TESTNET;

interface AbiResponse {
  contractSlug: string;
  abi: AbiRoot;
}

export const useContractAbi = (contract: string | undefined) => {
  const identity = useIdentity();
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
    return true;
  } catch (e) {
    console.error(e);
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
  const contract = new Contract(near.connection, contractId, abi);
  return contract;
};
