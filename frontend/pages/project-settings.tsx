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
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import DeleteProjectModal from '@/modules/core/components/modals/DeleteProjectModal';
import type { NextPageWithLayout } from '@/utils/types';

const ProjectSettings: NextPageWithLayout = () => {
  const { project } = useSelectedProject();
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
                  <TextLink>View & Manage API Keys</TextLink>
                </Link>
              </ListItem>

              <ListItem>
                <Link href="/projects" passHref>
                  <TextLink>View All Projects</TextLink>
                </Link>
              </ListItem>

              {project.org.personalForUserId !== null ? (
                <ListItem>
                  Looking to invite team members to the project?
                  <Link href="/organizations" passHref>
                    <TextLink>Create an organization to collaborate with others</TextLink>
                  </Link>
                </ListItem>
              ) : (
                <ListItem>
                  <Link href={`/organizations/${project.org.slug}`} passHref>
                    <TextLink>Take me to &quot;{project.org.name}&quot; organization</TextLink>
                  </Link>
                </ListItem>
              )}
            </List>

            <HR />

            <Button color="danger" onClick={() => setShowModal(true)}>
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

export default ProjectSettings;
