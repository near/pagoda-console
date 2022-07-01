import { truncateDecimal } from './truncate-decimal';

function divide(count: number, divisor: number) {
  return truncateDecimal(count / divisor, 2);
}

export function formatBytes(count?: number | unknown) {
  if (typeof count !== 'number') return '';

  if (count >= 1_000_000_000) return `${divide(count, 1_000_000_000)} GB`;
  if (count >= 1_000_000) return `${divide(count, 1_000_000)} MB`;
  if (count >= 1_000) return `${divide(count, 1_000)} KB`;

  return `${count} B`;
}
