// 123000050000000000000000000 => 123.00005 Ⓝ
// 50000000000000000000000 => 0.005 Ⓝ
// 50000000000000000000 => <0.00001 Ⓝ

import { formatNumber } from './format-number';

const decimalCount = 5;

export function formatYoctoNear(value?: string) {
  if (!value) return '';
  if (value === '0') return '0 Ⓝ';

  if (value.length <= 24) {
    let paddingLeftCount = 25 - value.length;

    while (paddingLeftCount > 0) {
      value = '0' + value;
      paddingLeftCount--;
    }

    value = '0.' + value.substring(0, decimalCount);
  } else {
    const leftOfPeriod = value.substring(0, value.length - 24);
    const rightOfPeriod = value.substring(value.length - 24);
    value = leftOfPeriod + '.' + rightOfPeriod.substring(0, decimalCount);
  }

  const strippedZeros = value.match(/^0*(\d+(?:\.(?:(?!0+$)\d)+)?)/);
  if (strippedZeros && strippedZeros[1]) value = strippedZeros[1];

  if (value === '0') {
    return '<0.00001 Ⓝ';
  }

  return `${formatNumber(value)} Ⓝ`;
}
