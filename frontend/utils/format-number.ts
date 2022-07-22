// 1 => 1
// 1234 => 1,234
// 1234.5555 => 1,234.5555

export function formatNumber(number: string | number) {
  const formatter = Intl.NumberFormat('en-US');
  return formatter.format(number as number); // This method actually does support number or string
}
