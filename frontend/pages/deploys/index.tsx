import { useEffect } from 'react';

import { Text } from '@/components/lib/Text';
import { useIsRepositoryTransferred, useRepositories } from '@/hooks/deploys';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import DeploysModule from '@/modules/deploys/components/DeploysModule';
import type { NextPageWithLayout } from '@/utils/types';

import PageHeader from './components/PageHeader';

const Deploys: NextPageWithLayout = () => {
  const project = useSelectedProject();
  const { repositories } = useRepositories(project.project?.slug);
  const { isTransferred, mutate } = useIsRepositoryTransferred(repositories?.[0].slug);

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await mutate();
      if (!result?.isTransferred) {
        return;
      }
      clearInterval(interval);
    }, 3000);

    return () => clearInterval(interval);
  }, [mutate]);

  return (
    <>
      {isTransferred === false && (
        <Text>Please accept the repository transfer from your Github email to view your deployments</Text>
      )}
      {isTransferred && (
        <>
          <PageHeader />
          <DeploysModule />
        </>
      )}
    </>
  );
};

Deploys.getLayout = useDashboardLayout;

export default Deploys;
