import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { List, ListItem } from '@/components/lib/List';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { TextLink } from '@/components/lib/TextLink';
import { withSelectedProject } from '@/components/with-selected-project';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSureProjectContext } from '@/hooks/project-context';
import { useProject } from '@/hooks/projects';
import DeleteProjectModal from '@/modules/core/components/modals/DeleteProjectModal';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ProjectSettings: NextPageWithLayout = () => {
  const { projectSlug } = useSureProjectContext();
  const { project } = useProject(projectSlug);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  if (!project) {
    return (
      <Section>
        <Flex stack gap="l">
          <H1>Project Settings</H1>
          <Spinner center />
        </Flex>
      </Section>
    );
  }

  return (
    <>
      <Section css={{ margin: 'auto' }}>
        <Container size="m">
          <Flex stack gap="l">
            <H1>Project Settings</H1>

            <List>
              <ListItem>
                <Link href="/apis?tab=keys" passHref>
                  <TextLink stableId={StableId.PROJECT_SETTINGS_VIEW_API_KEYS_LINK}>View & Manage API Keys</TextLink>
                </Link>
              </ListItem>

              <ListItem>
                <Link href="/projects" passHref>
                  <TextLink stableId={StableId.PROJECT_SETTINGS_VIEW_PROJECTS_LINK}>View All Projects</TextLink>
                </Link>
              </ListItem>
            </List>

            <HR />

            <Button
              stableId={StableId.PROJECT_SETTINGS_OPEN_DELETE_PROJECT_MODAL}
              color="danger"
              onClick={() => setShowModal(true)}
            >
              Remove Project
            </Button>
          </Flex>
        </Container>
      </Section>

      <DeleteProjectModal
        slug={project.slug}
        name={project.name}
        show={showModal}
        setShow={setShowModal}
        onDelete={() => router.push('/projects')}
      />
    </>
  );
};

ProjectSettings.getLayout = useDashboardLayout;

export default withSelectedProject(ProjectSettings);
