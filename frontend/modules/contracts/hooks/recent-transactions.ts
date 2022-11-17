import type * as RPC from '@pc/common/types/rpc';
import type { Net } from '@pc/database/clients/core';
import { useQuery } from '@tanstack/react-query';
import JSBI from 'jsbi';

import config from '@/utils/config';

export interface FinalityStatus {
  finalBlockHeight: number;
  finalBlockTimestampNanosecond: JSBI;
}

export function useFinalityStatus(net: Net) {
  return useQuery(['finality', net], async () => {
    const response = await fetch(config.url.rpc.default[net], {
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
    });
    const { result: finalBlock }: { result: RPC.ResponseMapping['block'] } = await response.json();
    return finalBlock
      ? {
          finalBlockTimestampNanosecond: JSBI.BigInt(finalBlock.header.timestamp_nanosec),
          finalBlockHeight: finalBlock.header.height,
        }
      : undefined;
  });
}
