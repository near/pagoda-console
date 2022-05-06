import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from 'react-bootstrap';

import EjectProjectModal from '@/components/modals/EjectProjectModal';
import ProjectSelector from '@/components/ProjectSelector';
import components from '@/components/tutorials/components';
import TableOfContents from '@/components/tutorials/TableOfContents';
import TutorialFooter from '@/components/tutorials/TutorialFooter';
import Content from '@/tutorials/nfts/md/8-marketplace.mdx';
import { useProject } from '@/utils/fetchers';
import { useRouteParam } from '@/utils/hooks';
import { useDashboardLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Marketplace: NextPageWithLayout = () => {
  const projectSlug = useRouteParam('project');
  const environment = useRouteParam('environment');
  const { project } = useProject(projectSlug);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <ProjectSelector />
      <TableOfContents />
      <Content components={components} />
      {project && (
        <TutorialFooter>
          <Button onClick={() => setShowModal(true)}>Complete Tutorial</Button>
          <EjectProjectModal
            slug={project.slug}
            name={project.name}
            show={showModal}
            setShow={setShowModal}
            onEject={() => router.push(`/project-analytics?project=${project.slug}&environment=${environment}`)}
          />
        </TutorialFooter>
      )}
    </>
  );
};

Marketplace.getLayout = useDashboardLayout;

export default Marketplace;
