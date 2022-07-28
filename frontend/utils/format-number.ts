export function formatNumber(number?: string | number | null) {
  if (number === '' || number === null || number === undefined) return '';

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
