import type * as RPC from '@pc/common/types/rpc';
import type { Net } from '@pc/database/clients/core';
import useSWR from 'swr';

import { usePublicStore } from '@/stores/public';
import config from '@/utils/config';

import { useQuery } from './query';
import { useRawQuery } from './raw-query';

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

export function usePublicOrPrivateContractQuery(slug: string | undefined) {
  const publicModeHasHydrated = usePublicStore((store) => store.hasHydrated);
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicContracts = usePublicStore((store) => store.contracts);
  const contractSlug = publicModeHasHydrated && !publicModeIsActive ? slug : undefined;
  const privateContractQuery = useQuery(['/projects/getContract', { slug: contractSlug || 'unknown' }], {
    enabled: Boolean(contractSlug),
  });
  const publicContractQuery = useRawQuery(['public-contract'], async () => {
    const contract = publicContracts.find((c) => c.slug === slug);
    if (!contract) {
      throw new Error(`No contract found by slug ${slug}`);
    }
    return contract;
  });

  return publicModeIsActive ? publicContractQuery : privateContractQuery;
}

export function usePublicOrPrivateContractsQuery(
  projectSlug: string | undefined,
  environmentSubId: number | undefined,
) {
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const publicContracts = usePublicStore((store) => store.contracts);
  const publicContractsQuery = useRawQuery(['public-contracts'], async () => publicContracts);
  const privateContractsQuery = useQuery(
    ['/projects/getContracts', { project: projectSlug ?? 'unknown', environment: environmentSubId ?? -1 }],
    { enabled: Boolean(projectSlug) && environmentSubId !== undefined },
  );

  return publicModeIsActive ? publicContractsQuery : privateContractsQuery;
}
