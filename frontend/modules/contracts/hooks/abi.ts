import type { Api } from '@pc/common/types/api';
import type { AbiRoot } from 'near-abi-client-js';
import { Contract as NearContract } from 'near-abi-client-js';
import { connect, keyStores } from 'near-api-js';
import useSWR from 'swr';

import { usePublicMode } from '@/hooks/public';
import config from '@/utils/config';
import { fetchApi } from '@/utils/http';

import { inspectContract } from '../utils/embedded-abi';

const RPC_API_ENDPOINT = config.url.rpc.default.TESTNET;

type Contract = Api.Query.Output<'/projects/getContract'>;

export const useEmbeddedAbi = (contract?: Contract) => {
  const { publicModeIsActive } = usePublicMode();
  return useSWR(publicModeIsActive || !contract ? null : ['inspect-contract', contract.net, contract.address], () =>
    inspectContract(contract!.net, contract!.address),
  );
};

export const usePrivateAbi = (contract?: Contract) => {
  return useSWR(contract ? ['/abi/getContractAbi', contract] : null, () =>
    fetchApi(['/abi/getContractAbi', { contract: contract!.slug }]),
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
