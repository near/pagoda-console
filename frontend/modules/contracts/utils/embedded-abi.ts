import { upgradeAbi } from '@pc/abi/upgrade';
import type { Net } from '@pc/database/clients/core';
import * as fzstd from 'fzstd';
import type { AbiRoot } from 'near-abi-client-js';
import * as nearApi from 'near-api-js';

import config from '@/utils/config';
import { assertUnreachable } from '@/utils/helpers';

// This version of NAJ needs a keyStore. We are only making view calls so we shouldn't need this. If we upgrade to v1.0.0, the keyStore should be removed.
const myKeyStore = new nearApi.keyStores.InMemoryKeyStore();

export async function inspectContract(net: Net, contract: string) {
  let nodeUrl;
  switch (net) {
    case 'MAINNET':
      nodeUrl = config.url.rpc.default.MAINNET;
      break;
    case 'TESTNET':
      nodeUrl = config.url.rpc.default.TESTNET;
      break;
    default:
      assertUnreachable(net);
  }
  let near;
  try {
    near = await nearApi.connect({
      nodeUrl,
      networkId: net.toLowerCase(),
      headers: {},
      keyStore: myKeyStore,
    });
  } catch (e) {
    console.error('failed to connect to near RPC while fetching embedded abi', e);
    return null;
  }

  let account;
  try {
    account = await near.account(contract);
  } catch (e) {
    console.error('failed to get account while fetching embedded abi for contract', contract, e);
    return null;
  }

  let response;
  try {
    response = await account.viewFunction(contract, '__contract_abi', {}, { parse: (v: any) => v });
  } catch (e: any) {
    // If the method does not exist on the contract, that's perfectly acceptable.
    if (!`${e.message}`.includes('FunctionCallError(MethodResolveError(MethodNotFound))')) {
      console.error('failed to call method __contract_abi while fetching embedded abi for contract', contract, e);
    }
    return null;
  }

  try {
    const decompressed = fzstd.decompress(response);
    const abi: any = JSON.parse(Buffer.from(decompressed).toString());
    const upgraded = upgradeAbi(abi) as AbiRoot;
    console.log('upgraded abi', upgraded);
    return upgraded;
  } catch (e) {
    console.error('failed to decompress or parse embedded abi for contract', contract, e);
  }
}
