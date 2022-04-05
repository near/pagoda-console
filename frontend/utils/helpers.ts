import type { Environment } from './interfaces';

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable Case: ${x}`);
}

export function returnAddressPattern(environment?: Environment) {
  // https://docs.near.org/docs/concepts/account#account-id-rules
  const addressPatternPrefix = '^(([a-z\\d]+[\\-_])*[a-z\\d]+\\.)*([a-z\\d]+[\\-_])*[a-z\\d]+';
  const addressPatternPostfix = environment?.net === 'MAINNET' ? '(.near)$' : '(.testnet)$';
  return new RegExp(addressPatternPrefix + addressPatternPostfix);
}
