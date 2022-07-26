// 1 => 1
// 1234 => 1,234
// 1234.5555 => 1,234.5555
// .34 => 0.34

export function formatNumber(number: string | number) {
  if (!number) return '';

  const pattern = /(-?\d+)(\d{3})/;
  const segments = number.toString().split('.');
  let integer = segments[0];
  const decimal = segments[1];

  while (pattern.test(integer)) {
    integer = integer.toString().replace(pattern, '$1,$2');
  }

  if (decimal) return `${integer || '0'}.${decimal}`;

  return integer;
}
