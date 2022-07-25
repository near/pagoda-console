import { BN } from 'bn.js';

import { U128 } from './constants';

export function validateMaxValueU128(value: string) {
  return new BN(value || '', 10).lte(U128) || 'Must be less than 2^128';
}
