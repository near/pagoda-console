export function truncateMiddle(value: string, prefixLength = 4, suffixLength = 4) {
  if (!value) return '';

  const totalLength = prefixLength + suffixLength;

  if (value.length > totalLength) {
    return (
      value.substring(0, prefixLength) + '...' + value.substring(value.length - (suffixLength + 1), value.length - 1)
    );
  }

  return value;
}
