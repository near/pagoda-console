import type { Net } from '@pc/common/types/core/types';

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable Case: ${x}`);
}

export function returnContractAddressRegex(environmentSubId: number) {
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

export const mapEnvironmentSubIdToNet = (environmentSubId: number): Net => {
  switch (environmentSubId) {
    case 2:
      return 'MAINNET';
    default:
      return 'TESTNET';
  }
};
