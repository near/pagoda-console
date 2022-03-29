import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement, footer: ReactElement | null) => ReactNode;
  getFooter?: () => ReactElement;
};
