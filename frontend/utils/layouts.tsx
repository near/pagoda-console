import type { ReactElement } from 'react';

import DashboardLayout from '../components/DashboardLayout';
import SimpleLayout from '../components/SimpleLayout';
import SimpleLogoutLayout from '../components/SimpleLogoutLayout';

export function useSimpleLayout(page: ReactElement, footer: ReactElement | null) {
  return <SimpleLayout footer={footer}>{page}</SimpleLayout>;
}

export function useSimpleLogoutLayout(page: ReactElement, footer: ReactElement | null) {
  return <SimpleLogoutLayout footer={footer}>{page}</SimpleLogoutLayout>;
}

export function useDashboardLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
}
