import type * as RPC from '@pc/common/types/rpc';
import type { Net } from '@pc/database/clients/core';
import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import config from '@/utils/config';

export const useRpc = <K extends keyof RPC.ResponseMapping>(
  net: Net,
  handler: K,
  params: RPC.RequestMapping[K],
  options?: Omit<
    UseQueryOptions<RPC.ResponseMapping[K], RPC.ErrorMapping[K], RPC.ResponseMapping[K], QueryKey>,
    'queryKey' | 'queryFn' | 'initialData'
  >,
) => {
  return useQuery(
    ['rpc', handler, params],
    async () => {
      const url = config.url.rpc.default[net];
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: handler,
          params,
        }),
      });
      const json: { result: RPC.ResponseMapping[K]; error?: unknown } = await response.json();
      if (json.error) {
        throw json.error;
      }
      return json.result;
    },
    options,
  );
};

export const useRpcQuery = <K extends keyof RPC.RpcQueryRequestTypeMapping>(
  net: Net,
  requestType: K,
  params: Record<string, unknown>,
  options?: Omit<
    UseQueryOptions<RPC.ResponseMapping['query'], RPC.ErrorMapping['query'], RPC.ResponseMapping['query'], QueryKey>,
    'queryKey' | 'queryFn' | 'initialData'
  >,
) =>
  useRpc(net, 'query', { request_type: requestType, ...params }, options) as UseQueryResult<
    RPC.RpcQueryResponseNarrowed<K>,
    RPC.ErrorMapping['query']
  >;
