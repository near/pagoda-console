import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import * as Tabs from '@/components/lib/Tabs';
import { useDashboardLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { ApiKeys } from '@/modules/apis/components/ApiKeys';
import DeleteProjectModal from '@/modules/core/components/modals/DeleteProjectModal';
import type { NextPageWithLayout } from '@/utils/types';

const ListApis: NextPageWithLayout = () => {
  const { project } = useSelectedProject();
  const activeTab = useRouteParam('tab', '?tab=keys', true);

  return (
    <Section>
      <Tabs.Root value={activeTab || ''}>
        <Tabs.List tabIndex={-1}>
          <Link href="?tab=keys" passHref>
            <Tabs.TriggerLink active={activeTab === 'keys'}>
              <FeatherIcon icon="key" /> Keys
            </Tabs.TriggerLink>
          </Link>
        </Tabs.List>

        <Tabs.Content value="keys">
          <Flex stack gap="l">
            <ApiKeys project={project} />
            <DeleteProject />
            {/*
              NOTE: The delete project button will live here temporarily until
              the new orgs/teams/projects management flow has been implemented.
            */}
          </Flex>
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
};

function DeleteProject() {
  const { project } = useSelectedProject();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  if (!project) return null;

  return (
    <>
      <Flex justify="end">
        <Button color="danger" onClick={() => setShowModal(true)}>
          Remove Project
        </Button>
      </Flex>

      <DeleteProjectModal
        slug={project.slug}
        name={project.name}
        show={showModal}
        setShow={setShowModal}
        onDelete={() => router.push('/projects')}
      />
    </>
  );
}

ListApis.getLayout = useDashboardLayout;

export default ListApis;
