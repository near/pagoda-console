import { BN } from 'bn.js';

import { U128 } from './constants';
import { convertNearToYocto } from './convert-near';

export function validateMaxYoctoU128(value: string) {
  return new BN(value || '', 10).lte(U128) || 'Must be less than 2^128 yoctoⓃ';
}

export function validateMaxNearU128(value: string) {
  return validateMaxYoctoU128(convertNearToYocto(value));
}

export function validateMaxNearDecimalLength(value: string) {
  return /^\d*\.?\d{0,24}$/.test(value) || 'Must have 24 or less decimal places';
}
