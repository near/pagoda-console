// * This is a modified version of the onErrorRetry function pulled from SWR source
// * in order to retain exponential backoff retry while adding custom conditions to
// * prevent retries such as on 403s. Hopefully the SWR team provides a cleaner solution
// * in the future and this can be removed
// *
// * Related Discussion: https://github.com/vercel/swr/discussions/1574
// *
// * Code pulled from:
// * https://github.com/vercel/swr/blob/72a54800662360e0c1f370e3fb32ee4f70020033/src/utils/config.ts
// *
// * Additional info: https://swr.vercel.app/docs/error-handling#error-retry
// *
// * This is a great candidate for making a PR back to an open source repo :)

import type { PublicConfiguration, Revalidator, RevalidatorOptions } from 'swr/dist/types';

export function customErrorRetry(
  err: any,
  __: string,
  config: Readonly<PublicConfiguration>,
  revalidate: Revalidator,
  opts: Required<RevalidatorOptions>,
): void {
  /*if (!preset.isVisible()) {
    // If it's hidden, stop. It will auto revalidate when refocusing.
    return
  }*/

  // custom for console
  switch (err.statusCode) {
    case 400:
    case 401:
    case 403:
    case 404:
      console.log(`breaking for status code of ${err.status}`);
      return;
  }

  const maxRetryCount = config.errorRetryCount;
  const currentRetryCount = opts.retryCount;

  // Exponential backoff
  const timeout =
    ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) * config.errorRetryInterval;

  if (maxRetryCount !== undefined && currentRetryCount > maxRetryCount) {
    return;
  }

  setTimeout(revalidate, timeout, opts);
}
