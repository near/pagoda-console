import JSBI from 'jsbi';

import * as BI from './bigint';

const POWER = 3;
const POWER_OF_10 = JSBI.BigInt(10 ** POWER);
export const formatToPowerOfTen = <P extends number>(
  input: string,
  maxPower: P,
): { quotient: string; remainder: string; prefix: P } => {
  const bigIntInput = JSBI.BigInt(input);
  const isInputNegative = JSBI.lessThan(bigIntInput, BI.zero);
  let quotient = isInputNegative ? JSBI.unaryMinus(bigIntInput) : bigIntInput;
  let currentPower: P = 0 as P;
  let remainder = '';
  while (JSBI.greaterThanOrEqual(quotient, POWER_OF_10) && currentPower < maxPower) {
    currentPower++;
    remainder = JSBI.remainder(quotient, POWER_OF_10).toString().padStart(POWER, '0') + remainder;
    quotient = JSBI.divide(quotient, POWER_OF_10);
  }
  return {
    quotient: (isInputNegative ? '-' : '') + quotient.toString(),
    remainder: remainder,
    prefix: currentPower,
  };
};

// Maximum decimal power is 11 because NEAR is capped by 1.250.000.000 tokens
// https://near.org/blog/near-token-supply-and-distribution/
export type NearDecimalPower = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export const NEAR_DENOMINATION: Record<NearDecimalPower, string> = {
  0: 'y',
  1: 'z',
  2: 'a',
  3: 'f',
  4: 'p',
  5: 'n',
  6: 'µ',
  7: 'm',
  8: '',
  9: 'k',
  10: 'M',
  11: 'G',
};

const LAST_SYMBOLS_QUANTITY = 4;
const DELIMITER = '..';
export const shortenString = (input: string, maxSymbols = 16): string => {
  if (input.length <= maxSymbols) {
    return input;
  }
  return `${input.slice(0, maxSymbols - (LAST_SYMBOLS_QUANTITY + DELIMITER.length))}${DELIMITER}${input.slice(
    -LAST_SYMBOLS_QUANTITY,
  )}`;
};
