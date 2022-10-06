import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import { EjectProjectModal } from '@/modules/core/components/modals/EjectProjectModal';
import components from '@/modules/core/components/tutorials/components';
import TableOfContents from '@/modules/core/components/tutorials/TableOfContents';
import TutorialFooter from '@/modules/core/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/modules/core/components/tutorials/TutorialPage';
import Content from '@/tutorials/nfts/md/8-marketplace.mdx';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const Marketplace: NextPageWithLayout = () => {
  const { project } = useSelectedProject();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <TutorialPage sidebar={<TableOfContents />}>
        <Content components={components} />
        {project && (
          <TutorialFooter>
            <Button stableId={StableId.TUTORIAL_CONTENT_COMPLETE_BUTTON} onClick={() => setShowModal(true)}>
              Complete Tutorial
            </Button>
            <EjectProjectModal
              slug={project.slug}
              name={project.name}
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

export default Marketplace;
