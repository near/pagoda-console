import type { Api } from '@pc/common/types/api';
import type * as RPC from '@pc/common/types/rpc';
import type { Net } from '@pc/database/clients/core';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { usePublicStore } from '@/stores/public';
import { queryApi } from '@/utils/api';
import config from '@/utils/config';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

export function useContracts(project: string | undefined, environment: number | undefined) {
  const {
    data: contracts,
    error,
    mutate,
  } = useSWR(
    project && environment ? ['/projects/getContracts' as const, project, environment] : null,
    (path, project, environment) => {
      return queryApi(path, { project, environment });
    },
  );

  return { contracts, error, mutate };
}

export function useContract(slug: string | undefined) {
  const { identity } = useAuth();

  const {
    data: contract,
    error,
    mutate,
  } = useSWR(identity && slug ? ['/projects/getContract' as const, slug, identity.uid] : null, (path, slug) => {
    return queryApi(path, { slug });
  });

  return { contract, error, mutate };
}

export function useContractMetrics(address: string | undefined, net: Net | undefined) {
  const { data, error, mutate } = useSWR(
    address && net ? [address, net] : null,
    async (address: string, net: Net) => {
      const res = await fetch(config.url.rpc.default[net], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: address,
          },
        }),
      }).then((res) => res.json() as Promise<{ result: RPC.RpcQueryResponseNarrowed<'view_account'>; error?: any }>);
      if (res.error) {
        throw new Error(res.error.name); // TODO decide whether to retry error
      }
      return res;
    },
    {
      shouldRetryOnError: false, // TODO decide whether to retry error
    },
  );

  return {
    metrics: data?.result,
    error,
    mutate,
  };
}

export function usePublicOrPrivateContract(slug: string | undefined) {
  const publicModeHasHydrated = usePublicStore((store) => store.hasHydrated);
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicContracts = usePublicStore((store) => store.contracts);
  const { contract: privateContract, error } = useContract(
    publicModeHasHydrated && !publicModeIsActive ? slug : undefined,
  );
  const publicContract = publicContracts.find((c) => c.slug === slug);

  return {
    contract: publicModeIsActive ? publicContract : privateContract,
    error,
  };
}

export function usePublicOrPrivateContracts(privateContracts: Contract[] | undefined) {
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicContracts = usePublicStore((store) => store.contracts);

  return {
    contracts: publicModeIsActive ? publicContracts : privateContracts,
  };
}
