import type { Environment } from './interfaces';

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable Case: ${x}`);
}

export function returnContractAddressRegex(environment?: Environment) {
  // https://docs.near.org/docs/concepts/account#account-id-rules
  const prefix = '^(([a-z\\d]+[\\-_])*[a-z\\d]+\\.)*([a-z\\d]+[\\-_])*[a-z\\d]+';
  const postfix = environment?.net === 'MAINNET' ? '(.near)$' : '(.testnet)$';
  return new RegExp(prefix + postfix);
}
