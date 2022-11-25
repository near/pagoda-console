import type { Api } from '@pc/common/types/api';
import type { Projects } from '@pc/common/types/core';
import type * as RPC from '@pc/common/types/rpc';
import type { Net } from '@pc/database/clients/core';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import analytics from '@/utils/analytics';
import config from '@/utils/config';
import { fetchApi } from '@/utils/http';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

export async function deleteContract(contract: Contract) {
  try {
    await fetchApi(['/projects/removeContract', { slug: contract.slug }]);
    analytics.track('DC Remove Contract', {
      status: 'success',
      contractId: contract.address,
    });
    return true;
  } catch (e: any) {
    analytics.track('DC Remove Contract', {
      status: 'failure',
      contractId: contract.address,
      error: e.message,
    });
    console.error(e);
    return false;
  }
}

export function useContracts(project: Projects.ProjectSlug, environment: number) {
  const { identity } = useAuth();

  const {
    data: contracts,
    error,
    mutate,
  } = useSWR(
    identity ? ['/projects/getContracts' as const, project, environment, identity.uid] : null,
    (key, project, environment) => {
      return fetchApi([key, { project, environment }]);
    },
  );

  return { contracts, error, mutate };
}

export function useContract(slug: Projects.ContractSlug | undefined) {
  const { identity } = useAuth();

  const {
    data: contract,
    error,
    mutate,
  } = useSWR(identity && slug ? ['/projects/getContract' as const, slug, identity.uid] : null, (key, slug) => {
    return fetchApi([key, { slug }]);
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
