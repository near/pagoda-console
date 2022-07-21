// 1,000 => 1000
// -01000 => -1000
// 01,200.5010 => 1200.501

export function sanitizeNumber(value?: string) {
  if (!value) return '';

  const stripped = value.replace(/[^\d-.]/g, '');
  const strippedZeros = stripped.match(/^(-*)?0*(\d+(?:\.(?:(?!0+$)\d)+)?)/);

  if (strippedZeros && strippedZeros[2]) {
    return (strippedZeros[1] || '') + strippedZeros[2];
  }

  return '';
}
