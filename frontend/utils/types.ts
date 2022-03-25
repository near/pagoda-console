import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement, footer: ReactElement | null) => ReactNode;
  getFooter?: () => ReactElement;
};
