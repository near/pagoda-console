import type { Api } from '@pc/common/types/api';
import type { Net } from '@pc/database/clients/core';

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable Case: ${x}`);
}

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

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

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const mapEnvironmentSubIdToNet = (environmentSubId: number): Net => {
  switch (environmentSubId) {
    case 2:
      return 'MAINNET';
    default:
      return 'TESTNET';
  }
};

export const nonNullishGuard = <T>(arg: T): arg is Exclude<T, null | undefined> => arg !== null && arg !== undefined;
