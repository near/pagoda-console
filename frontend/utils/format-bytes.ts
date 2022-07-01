function round(count: number) {
  parseFloat(count.toFixed(1));
}

export function formatBytes(count?: number | unknown) {
  if (typeof count !== 'number') return '';

  if (count >= 1_000_000) {
    return `${round(count / 1_000_000)} MB`;
  }
}
