import type * as RPC from '@pc/common/types/rpc';
import type { Net } from '@pc/database/clients/core';
import JSBI from 'jsbi';
import useSWR from 'swr';

import config from '@/utils/config';

export interface FinalityStatus {
  finalBlockHeight: number;
  finalBlockTimestampNanosecond: JSBI;
}

export function useFinalityStatus(net: Net | undefined) {
  const { data, error } = useSWR(net ? [config.url.rpc.default[net]] : null, async (key) => {
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
    }).then((res) => res.json() as Promise<{ result: RPC.ResponseMapping['block'] }>);
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
