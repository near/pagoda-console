import { formatNumber } from './format-number';

const decimalCount = 5;

export function convertYoctoToNear(value?: string | null, shouldFormat?: boolean) {
  if (!value) return '';
  if (value === '0') return shouldFormat ? '0 Ⓝ' : '0';

  if (value.length <= 24) {
    let paddingLeftCount = 24 - value.length;

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
    return shouldFormat ? '<0.00001 Ⓝ' : '0.00001';
  }

  return shouldFormat ? `${formatNumber(value)} Ⓝ` : value;
}

export function convertNearToYocto(value?: string | null, shouldFormat?: boolean) {
  if (!value) return '';
  if (value === '0') return shouldFormat ? '0 yoctoⓃ' : '0';

  const segments = value.split('.');
  const integer = segments[0] || '';
  const decimal = segments[1] || '';
  const zeros = 24 - decimal.length;
  value = `${integer}${decimal}`.replace(/^0*/, '');

  for (let i = 0; i < zeros; i++) {
    value += '0';
  }

  return shouldFormat ? `${formatNumber(value)} yoctoⓃ` : value;
}
