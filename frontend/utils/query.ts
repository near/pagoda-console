import type { BareFetcher, PublicConfiguration, Revalidator, RevalidatorOptions } from 'swr/dist/types';

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

export const getCustomErrorRetry =
  (codes = [400, 401, 403, 404]) =>
  <Data = any>(
    err: any,
    __: string,
    config: Readonly<PublicConfiguration<Data, any, BareFetcher<Data>>>,
    revalidate: Revalidator,
    opts: Required<RevalidatorOptions>,
  ): void => {
    if (codes.includes(err.statusCode)) {
      console.log(`breaking for status code of ${err.status}`);
      return;
    }

    const maxRetryCount = config.errorRetryCount;
    const currentRetryCount = opts.retryCount;

    const timeout = ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) + 1500;

    if (maxRetryCount !== undefined && currentRetryCount > maxRetryCount) {
      return;
    }

    setTimeout(revalidate, timeout, opts);
  };
