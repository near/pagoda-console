import type { Projects } from '@pc/common/types/core';
import type { Net } from '@pc/common/types/core/types';

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable Case: ${x}`);
}

export function returnContractAddressRegex(environmentSubId: Projects.EnvironmentId) {
  // https://docs.near.org/docs/concepts/account#account-id-rules

  const prefix = '^(([a-z\\d]+[\\-_])*[a-z\\d]+\\.)*([a-z\\d]+[\\-_])*[a-z\\d]+';
  let postfix = '';
  const net = mapEnvironmentSubIdToNet(environmentSubId);

  switch (net) {
    case 'MAINNET':
      postfix = '(.near)$';
      break;
    case 'TESTNET':
      postfix = '(.testnet)$';
      break;
    default:
      assertUnreachable(net);
  }

  return new RegExp(prefix + postfix);
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const nonNullishGuard = <T>(arg: T): arg is Exclude<T, null | undefined> => arg !== null && arg !== undefined;

export const mapEnvironmentSubIdToNet = (environmentSubId: Projects.EnvironmentId): Net => {
  switch (environmentSubId) {
    case 2:
      return 'MAINNET';
    default:
      return 'TESTNET';
  }
};

export const mapNetToEnvironmentSubId = (net: Net): Projects.EnvironmentId => {
  switch (net) {
    case 'MAINNET':
      return 2;
    default:
      return 1;
  }
};
