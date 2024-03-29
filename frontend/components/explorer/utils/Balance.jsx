/// Copied from near-wallet project:
import JSBI from 'jsbi';
import { PureComponent } from 'react';

import { Tooltip } from '@/components/lib/Tooltip';
// import { utils } from "near-api-js";

class Balance extends PureComponent {
  render() {
    const {
      amount,
      label = null,
      suffix = undefined,
      className = undefined,
      formulatedAmount = undefined,
      fracDigits = 5,
    } = this.props;

    if (!amount) {
      throw new Error('amount property should not be null');
    }

    const defaultLabel = 'Ⓝ';

    let amountShow = !formulatedAmount ? formatNEAR(amount, fracDigits) : formulatedAmount;
    let amountPrecise = showInYocto(amount);
    return (
      <>
        <Tooltip content={amountPrecise} side="bottom">
          <span className={className}>
            {amountShow}
            {suffix}
            &nbsp;
            {label ?? defaultLabel}
          </span>
        </Tooltip>
      </>
    );
  }
}

export const formatNEAR = (amount, fracDigits = 5) => {
  // custom for console
  let ret = formatNearAmount(amount.toString(), fracDigits);

  if (amount === '0') {
    return amount;
  } else if (ret === '0') {
    return `<${!fracDigits ? `0` : `0.${'0'.repeat((fracDigits || 1) - 1)}1`}`;
  }
  return ret;
};

export const showInYocto = (amountStr) => {
  return formatWithCommas(amountStr) + ' yoctoⓃ';
};

export const formatWithCommas = (value) => {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
    value = value.toString().replace(pattern, '$1,$2');
  }
  return value;
};

export default Balance;

// BELOW IS PULLED FROM NEAR-API-JS ─────────────────────────────────────────────────────────────────────────────────

/**
 * Exponent for calculating how many indivisible units are there in one NEAR. See {@link NEAR_NOMINATION}.
 */
export const NEAR_NOMINATION_EXP = 24;

/**
 * Number of indivisible units in one NEAR. Derived from {@link NEAR_NOMINATION_EXP}.
 */
export const NEAR_NOMINATION = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(NEAR_NOMINATION_EXP));

// Pre-calculate offests used for rounding to different number of digits
const ROUNDING_OFFSETS = [];
const BN10 = JSBI.BigInt(10);
for (let i = 0, offset = JSBI.BigInt(5); i < NEAR_NOMINATION_EXP; i++, offset = JSBI.multiply(offset, BN10)) {
  ROUNDING_OFFSETS[i] = offset;
}

/**
 * Convert account balance value from internal indivisible units to NEAR. 1 NEAR is defined by {@link NEAR_NOMINATION}.
 * Effectively this divides given amount by {@link NEAR_NOMINATION}.
 *
 * @param balance decimal string representing balance in smallest non-divisible NEAR units (as specified by {@link NEAR_NOMINATION})
 * @param fracDigits number of fractional digits to preserve in formatted string. Balance is rounded to match given number of digits.
 * @returns Value in Ⓝ
 */
export function formatNearAmount(balance, fracDigits = NEAR_NOMINATION_EXP) {
  let balanceBN = JSBI.BigInt(balance);
  if (fracDigits !== NEAR_NOMINATION_EXP) {
    // Adjust balance for rounding at given number of digits
    const roundingExp = NEAR_NOMINATION_EXP - fracDigits - 1;
    if (roundingExp > 0) {
      balanceBN = JSBI.add(balanceBN, ROUNDING_OFFSETS[roundingExp]);
    }
  }

  balance = balanceBN.toString();
  const wholeStr = balance.substring(0, balance.length - NEAR_NOMINATION_EXP) || '0';
  const fractionStr = balance
    .substring(balance.length - NEAR_NOMINATION_EXP)
    .padStart(NEAR_NOMINATION_EXP, '0')
    .substring(0, fracDigits);

  return trimTrailingZeroes(`${formatWithCommas(wholeStr)}.${fractionStr}`);
}

/**
 * Removes .000… from an input
 * @param value A value that may contain trailing zeroes in the decimals place
 * @returns string The value without the trailing zeros
 */
function trimTrailingZeroes(value) {
  return value.replace(/\.?0*$/, '');
}
