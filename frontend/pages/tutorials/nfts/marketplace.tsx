import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { withSelectedProject } from '@/components/with-selected-project';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import { EjectProjectModal } from '@/modules/core/components/modals/EjectProjectModal';
import components from '@/modules/core/components/tutorials/components';
import TableOfContents from '@/modules/core/components/tutorials/TableOfContents';
import TutorialFooter from '@/modules/core/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/modules/core/components/tutorials/TutorialPage';
import Content from '@/tutorials/nfts/md/8-marketplace.mdx';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const Marketplace: NextPageWithLayout = () => {
  const { projectSlug } = useSureProjectContext();
  const projectQuery = useQuery(['/projects/getDetails', { slug: projectSlug }]);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        {projectQuery.data && (
          <TutorialFooter>
            <Button stableId={StableId.TUTORIAL_CONTENT_COMPLETE_BUTTON} onClick={() => setShowModal(true)}>
              Complete Tutorial
            </Button>
            <EjectProjectModal
              slug={projectQuery.data.slug}
              name={projectQuery.data.name}
              show={showModal}
              setShow={setShowModal}
              onEject={() => router.push('/contracts')}
            />
          </TutorialFooter>
        )}
      </TutorialPage>
    </>
  );
};

Marketplace.getLayout = useDashboardLayout;

export default withSelectedProject(Marketplace);
