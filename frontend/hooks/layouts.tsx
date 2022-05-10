import type { ReactElement } from 'react';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import SimpleLayout from '@/components/layouts/SimpleLayout';
import SimpleLogoutLayout from '@/components/layouts/SimpleLogoutLayout';

export function useSimpleLayout(page: ReactElement, footer: ReactElement | null) {
  return <SimpleLayout footer={footer}>{page}</SimpleLayout>;
}

export function useSimpleLogoutLayout(page: ReactElement, footer: ReactElement | null) {
  return <SimpleLogoutLayout footer={footer}>{page}</SimpleLogoutLayout>;
}

export function useDashboardLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
}
