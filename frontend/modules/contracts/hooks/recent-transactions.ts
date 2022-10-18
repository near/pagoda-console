import JSBI from 'jsbi';
import useSWR from 'swr';

import type { Transaction } from '@/components/explorer/transactions/types';
import { useIdentity } from '@/hooks/user';
import config from '@/utils/config';
import { authenticatedPost } from '@/utils/http';
import type { FinalityStatus, NetOption } from '@/utils/types';

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

export function useFinalityStatus(net: NetOption | undefined) {
  const { data, error } = useSWR<any>(net ? [config.url.rpc.default[net]] : null, async (key) => {
    return await fetch(key, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'block',
        params: {
          finality: 'final',
        },
      }),
    }).then((res) => res.json());
  });

  const finalBlock = data?.result;

  const finalityStatus: FinalityStatus | undefined = finalBlock
    ? {
        finalBlockTimestampNanosecond: JSBI.BigInt(finalBlock.header.timestamp_nanosec),
        finalBlockHeight: finalBlock.header.height,
      }
    : undefined;

  return { finalityStatus, error };
}
