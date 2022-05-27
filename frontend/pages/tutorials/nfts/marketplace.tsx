import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { EjectProjectModal } from '@/components/modals/EjectProjectModal';
import components from '@/components/tutorials/components';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import { TutorialPage } from '@/components/tutorials/TutorialPage';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import Content from '@/tutorials/nfts/md/8-marketplace.mdx';
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
            <Button onClick={() => setShowModal(true)}>Complete Tutorial</Button>
            <EjectProjectModal
              slug={project.slug}
              name={project.name}
              show={showModal}
              setShow={setShowModal}
              onEject={() => router.push('/project-analytics')}
            />
          </TutorialFooter>
        )}
      </TutorialPage>
    </>
  );
};

Marketplace.getLayout = useDashboardLayout;

export default Marketplace;
