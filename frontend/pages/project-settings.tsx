import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { List, ListItem } from '@/components/lib/List';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import DeleteProjectModal from '@/modules/core/components/modals/DeleteProjectModal';
import { StableId } from '@/utils/stable-ids';
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
                  <TextLink stableId={StableId.PROJECT_SETTINGS_VIEW_API_KEYS_LINK}>View & Manage API Keys</TextLink>
                </Link>
              </ListItem>

              <ListItem>
                <Link href="/projects" passHref>
                  <TextLink stableId={StableId.PROJECT_SETTINGS_VIEW_PROJECTS_LINK}>View All Projects</TextLink>
                </Link>
              </ListItem>
            </List>

            <Card>
              <Flex align="center" gap="l">
                <FeatherIcon icon="users" size="m" />

                <Text>
                  Looking to invite team members?{' '}
                  {project.org.personalForUserId ? (
                    <>
                      <TextLink href="/organizations" stableId={StableId.PROJECT_SETTINGS_CREATE_ORGANIZATION_LINK}>
                        Create an organization
                      </TextLink>{' '}
                      to collaborate with others. For now, you&apos;ll need to create a new project after creating the
                      organization.
                    </>
                  ) : (
                    <>
                      <TextLink
                        href={`/organizations/${project.org.slug}`}
                        stableId={StableId.PROJECT_SETTINGS_INVITE_ORGANIZATION_LINK}
                      >
                        View your organization
                      </TextLink>{' '}
                      to send invites and collaborate with others.
                    </>
                  )}
                </Text>
              </Flex>
            </Card>

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

export default ProjectSettings;
