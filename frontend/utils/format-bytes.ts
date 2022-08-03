import { truncateDecimal } from './truncate-decimal';

function divide(bytes: number, divisor: number) {
  return truncateDecimal(bytes / divisor, 2);
}

export function formatBytes(bytes?: number | null) {
  if (typeof bytes !== 'number') return '';

  if (bytes >= 1_000_000_000) return `${divide(bytes, 1_000_000_000)} GB`;
  if (bytes >= 1_000_000) return `${divide(bytes, 1_000_000)} MB`;
  if (bytes >= 1_000) return `${divide(bytes, 1_000)} KB`;

  return `${bytes} B`;
}
