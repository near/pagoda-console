import useSWR from 'swr';

import type { Transaction } from '@/components/explorer/components/transactions/types';
import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { NetOption } from '@/utils/types';

export function useRecentTransactions(
  contracts: string[],
  net: NetOption,
): { transactions: Transaction[]; error: any } {
  const identity = useIdentity();
  // TODO (P2+) look into whether using contracts as part of the SWR key will cause a large
  // amount of unnecessary caching, since every modification to the contract set will be a
  // separate key
  const { data: transactions, error } = useSWR(
    identity && contracts && net ? ['/projects/getTransactions', contracts.join(','), net, identity.uid] : null,
    (key: string, contracts: string, net: NetOption) => {
      return authenticatedPost(key, {
        contracts: contracts.split(','),
        net,
      });
    },
  );

  return { transactions, error };
}
