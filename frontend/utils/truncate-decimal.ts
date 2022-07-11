/*
  Based on this answer: https://stackoverflow.com/a/11818658

  This utility is useful when needing to truncate a decimal number without
  rounding it - as does toFixed().

  truncateDecimal(100.96, 1) => "100.9"
  (100.96).toFixed(1) => "101.0"
*/

export function truncateDecimal(number: number, fixed: number) {
  const regex = new RegExp(`^-?\\d+(?:.\\d{0,${fixed || -1}})?`);
  const match = number.toString().match(regex);
  return match ? match[0] : '';
}
