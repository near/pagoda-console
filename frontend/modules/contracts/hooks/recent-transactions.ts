import type { Net } from '@pc/database/clients/core';
import useSWR from 'swr';

import { fetchApi } from '@/utils/http';

export function useRecentTransactions(contract: string | undefined, net: Net | undefined) {
  // TODO (P2+) look into whether using contracts as part of the SWR key will cause a large
  // amount of unnecessary caching, since every modification to the contract set will be a
  // separate key

  const { data: transactions, error } = useSWR(
    contract && net ? ['/explorer/getTransactions' as const, contract, net] : null,
    (key, contracts, net) => {
      return fetchApi([key, { contracts: contracts.split(','), net }], true);
    },
  );

  return { transactions, error };
}
