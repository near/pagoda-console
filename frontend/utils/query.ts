import type { RetryDelayValue, RetryValue } from '@tanstack/query-core/build/lib/retryer';

export const getShouldRetry =
  (skipCodes: number[]): RetryValue<unknown> =>
  (attempts, err: any) => {
    if (attempts >= 5) {
      return false;
    }
    if (skipCodes.includes(err.statusCode)) {
      console.log(`breaking for status code of ${err.status}`);
      return false;
    }
    return true;
  };

export const retryDelay: RetryDelayValue<unknown> = (attempts) =>
  ~~((Math.random() + 0.5) * (1 << (attempts < 8 ? attempts : 8))) * 5000;
