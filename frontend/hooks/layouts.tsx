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

export function wrapDashboardLayoutWithOptions(options: DashboardLayoutProps) {
  /*
    If we named this function "useDashboardLayoutWithOptions", ES Lint throws
    an error to help prevent invalid use of hooks on the top level. We might
    want to consider renaming the exports of this file and moving it to the
    "/utils" folder since these functions aren't being used as actual hooks.
  */

  const useLayout = (page: ReactElement) => {
    return <DashboardLayout {...options}>{page}</DashboardLayout>;
  };

  return useLayout;
}
