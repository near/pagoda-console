import type { ReactElement } from 'react';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { SimpleLayout } from '@/components/layouts/SimpleLayout';

export function useSimpleLayout(page: ReactElement) {
  return <SimpleLayout>{page}</SimpleLayout>;
}

export function useDashboardLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
}
