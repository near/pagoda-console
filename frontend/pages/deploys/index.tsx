import { useDashboardLayout } from '@/hooks/layouts';
import DeploysModule from '@/modules/deploys/components/DeploysModule';
import type { NextPageWithLayout } from '@/utils/types';

import PageHeader from './components/PageHeader';

const Deploys: NextPageWithLayout = () => (
  <>
    <PageHeader />
    <DeploysModule />
  </>
);

Deploys.getLayout = useDashboardLayout;

export default Deploys;
