import type { ComponentProps, ReactElement } from 'react';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { SimpleLayout } from '@/components/layouts/SimpleLayout';
import { SimpleLogoutLayout } from '@/components/layouts/SimpleLogoutLayout';

type DashboardLayoutProps = Omit<ComponentProps<typeof DashboardLayout>, 'children'>;

export function useDashboardLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
}

export function useSimpleLayout(page: ReactElement) {
  return <SimpleLayout>{page}</SimpleLayout>;
}

export function useSimpleLogoutLayout(page: ReactElement) {
  return <SimpleLogoutLayout>{page}</SimpleLogoutLayout>;
}

export function dashboardLayoutWithOptions(options: DashboardLayoutProps) {
  /*
    If we name this function "useDashboardLayoutWithOptions", ES Lint throws
    an error to help prevent invalid use of hooks on the top level.
  */

  const useLayout = (page: ReactElement) => {
    return <DashboardLayout {...options}>{page}</DashboardLayout>;
  };

  return useLayout;
}
