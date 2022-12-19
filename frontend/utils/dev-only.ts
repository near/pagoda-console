import type { GetStaticProps } from 'next';

/**
 * Implementation of Next.js getStaticProps which only allows
 * the page to render when running the frontend locally for
 * development purposes
 */
export const getStaticProps: GetStaticProps = async (_) => {
  if (process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'LOCAL') {
    return {
      notFound: true,
    };
  } else {
    return { props: {} };
  }
};
