import JSBI from 'jsbi';

import * as BI from '@/utils/bigint';

const MGAS = JSBI.exponentiate(BI.ten, JSBI.BigInt(6));
const GGAS = JSBI.multiply(MGAS, JSBI.BigInt(1000));
const TGAS = JSBI.multiply(GGAS, JSBI.BigInt(1000));

export const convertGasToMgas = (gas: string) => {
  if (!gas) return '0';
  return JSBI.multiply(JSBI.BigInt(gas), MGAS).toString();
};

export const convertGasToGgas = (gas: string) => {
  if (!gas) return '0';
  const value = JSBI.BigInt(gas);
  return JSBI.multiply(value, GGAS).toString();
};

export const convertGasToTgas = (gas: string) => {
  if (!gas) return '0';
  const value = JSBI.BigInt(gas);
  return JSBI.multiply(value, TGAS).toString();
};

export const formatGas = (gas: string) => {
  let gasShow = '';
  if (!gas) {
    return gasShow;
  }
  const value = JSBI.BigInt(gas);
  if (JSBI.greaterThan(value, TGAS)) {
    gasShow = `${JSBI.divide(value, TGAS).toString()} Tgas`;
  } else if (JSBI.greaterThan(value, GGAS)) {
    gasShow = `${JSBI.divide(value, GGAS).toString()} Ggas`;
  } else if (JSBI.greaterThan(value, MGAS)) {
    gasShow = `${JSBI.divide(value, MGAS).toString()} Mgas`;
  } else {
    gasShow = `${gas.toString()} gas`;
  }
  return gasShow;
};
