import type { Api } from '@pc/common/types/api';
import type { AbiRoot } from 'near-abi-client-js';
import { Contract as NearContract } from 'near-abi-client-js';
import { connect, keyStores } from 'near-api-js';
import useSWR from 'swr';

import { usePublicMode } from '@/hooks/public';
import { api } from '@/utils/api';
import config from '@/utils/config';

import { inspectContract } from '../utils/embedded-abi';

const RPC_API_ENDPOINT = config.url.rpc.default.TESTNET;

type Contract = Api.Query.Output<'/projects/getContract'>;

export const useEmbeddedAbi = (contract?: Contract) => {
  return useSWR(contract ? ['inspect-contract', contract.net, contract.address] : null, (key, net, address) => {
    return inspectContract(net, address);
  });
};

export const usePrivateAbi = (contract?: Contract) => {
  const { publicModeIsActive } = usePublicMode();
  return useSWR(
    contract && !publicModeIsActive ? ['/abi/getContractAbi' as const, contract.slug] : null,
    (path, contract) => {
      return api.query(path, { contract });
    },
  );
};

// Returns both embedded ABI in the wasm and manually uploaded ABI.
export const useAnyAbi = (contract?: Contract) => {
  return {
    embeddedQuery: useEmbeddedAbi(contract),
    privateQuery: usePrivateAbi(contract),
  };
};

export const initContractMethods = async (
  networkId: string,
  contractId: string,
  abi: AbiRoot,
): Promise<NearContract> => {
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
