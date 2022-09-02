import useSWR from 'swr';

import type { Transaction } from '@/components/explorer/transactions/types';
import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { NetOption } from '@/utils/types';

export function useRecentTransactions(contract: string | undefined, net: NetOption | undefined) {
  const identity = useIdentity();
  // TODO (P2+) look into whether using contracts as part of the SWR key will cause a large
  // amount of unnecessary caching, since every modification to the contract set will be a
  // separate key

  const { data: transactions, error } = useSWR<Transaction[]>(
    identity && contract && net ? ['/projects/getTransactions', contract, net, identity.uid] : null,
    (key, contracts, net) => {
      return authenticatedPost(key, {
        contracts: contracts.split(','),
        net,
      });
    },
  );

  return { transactions, error };
}
