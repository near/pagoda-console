import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import type { Transaction } from '@/modules/core/components/explorer/components/transactions/types';
import { authenticatedPost } from '@/utils/http';
import type { NetOption } from '@/utils/types';

export function useRecentTransactions(contracts: string[] | undefined, net: NetOption) {
  const identity = useIdentity();
  // TODO (P2+) look into whether using contracts as part of the SWR key will cause a large
  // amount of unnecessary caching, since every modification to the contract set will be a
  // separate key

  const { data: transactions, error } = useSWR<Transaction[]>(
    identity && contracts && net ? ['/projects/getTransactions', contracts.join(','), net, identity.uid] : null,
    (key, contracts, net) => {
      return authenticatedPost(key, {
        contracts: contracts.split(','),
        net,
      });
    },
  );

  return { transactions, error };
}
