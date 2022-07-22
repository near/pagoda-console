// 1 => 1
// 1234 => 1,234
// 1234.5555 => 1,234.5555

export function formatNumber(number: string) {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(number)) {
    number = number.toString().replace(pattern, '$1,$2');
  }
  return number;
}
