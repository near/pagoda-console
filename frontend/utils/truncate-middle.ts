export function truncateMiddle(value: string, prefixLength = 4, suffixLength = 4) {
  if (!value) return '';

  const totalLength = prefixLength + suffixLength;

  if (value.length > totalLength) {
    return value.slice(0, prefixLength) + '…' + value.slice(suffixLength * -1);
  }

  return value;
}
