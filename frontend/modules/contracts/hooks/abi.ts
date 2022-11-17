import type { Api } from '@pc/common/types/api';
import { useQuery as useRawQuery } from '@tanstack/react-query';
import type { AbiRoot, AnyContract } from 'near-abi-client-js';
import { Contract as NearContract } from 'near-abi-client-js';
import { connect, keyStores } from 'near-api-js';

import { useQuery } from '@/hooks/query';
import config from '@/utils/config';

import { inspectContract } from '../utils/embedded-abi';

const RPC_API_ENDPOINT = config.url.rpc.default.TESTNET;

type Contract = Api.Query.Output<'/projects/getContract'>;

// Prefers an embedded ABI in the wasm, if there is one, else returns any manually uploaded ABI.
export const useAnyAbi = (contract: Contract) => {
  return {
    embeddedQuery: useRawQuery(['inspect-contract', contract.net, contract.address], () =>
      inspectContract(contract.net, contract.address),
    ),
    query: useQuery(['/abi/getContractAbi', { contract: contract.slug }]),
  };
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
