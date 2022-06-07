import type { ReactElement } from 'react';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { SimpleLayout } from '@/components/layouts/SimpleLayout';
import { SimpleLogoutLayout } from '@/components/layouts/SimpleLogoutLayout';

export function useDashboardLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
}

export function useSimpleLayout(page: ReactElement) {
  return <SimpleLayout>{page}</SimpleLayout>;
}

export function useSimpleLogoutLayout(page: ReactElement) {
  return <SimpleLogoutLayout>{page}</SimpleLogoutLayout>;
}
