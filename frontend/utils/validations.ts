import JSBI from 'jsbi';

import { U128 } from './constants';
import { convertNearToYocto } from './convert-near';

export function validateInteger(value: string) {
  if (!value) return true;
  return value.indexOf('.') === -1 || 'Must be an integer';
}

export function validateMaxYoctoU128(value: string) {
  return JSBI.lessThanOrEqual(JSBI.BigInt(value || ''), U128) || 'Must be less than 2^128 yoctoⓃ';
}

export function validateMaxNearU128(value: string) {
  return validateMaxYoctoU128(convertNearToYocto(value));
}

export function validateMaxNearDecimalLength(value: string) {
  return /^\d*\.?\d{0,24}$/.test(value) || 'Must have 24 or less decimal places';
}
