// 1 => 1
// 1234 => 1,234
// 1234.5555 => 1,234.5555

export function formatNumber(number: string | number) {
  return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
}
