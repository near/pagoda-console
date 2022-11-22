import JSBI from 'jsbi';

import { convertNearToYocto } from '@/utils/convert-near';

const convertNearDeposit = (deposit: string, nearFormat: string) => {
  switch (nearFormat) {
    case 'NEAR':
      return JSBI.BigInt(convertNearToYocto(deposit));
    case 'yoctoⓃ':
      return JSBI.BigInt(deposit);
    default:
      return JSBI.BigInt(deposit);
  }
};

export default convertNearDeposit;
