import type { NextRouter } from 'next/router';

import type { Environment } from './types';

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable Case: ${x}`);
}

export function returnContractAddressRegex(environment?: Environment) {
  // https://docs.near.org/docs/concepts/account#account-id-rules

  if (!environment) {
    return /.*/;
  }

  const prefix = '^(([a-z\\d]+[\\-_])*[a-z\\d]+\\.)*([a-z\\d]+[\\-_])*[a-z\\d]+';
  let postfix = '';

  switch (environment.net) {
    case 'MAINNET':
      postfix = '(.near)$';
      break;
    case 'TESTNET':
      postfix = '(.testnet)$';
      break;
    default:
      assertUnreachable(environment.net);
  }

  return new RegExp(prefix + postfix);
}

export function signInRedirectHandler(router: NextRouter, defaultRedirectUrl: string) {
  const redirectUrl = sessionStorage.getItem('signInRedirectUrl') || defaultRedirectUrl;
  sessionStorage.removeItem('signInRedirectUrl');
  router.push(redirectUrl);
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
