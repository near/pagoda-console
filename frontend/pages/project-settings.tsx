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
import { withSelectedProject } from '@/components/with-selected-project';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import DeleteProjectModal from '@/modules/core/components/modals/DeleteProjectModal';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ProjectSettings: NextPageWithLayout = () => {
  const { projectSlug } = useSureProjectContext();
  const projectQuery = useQuery(['/projects/getDetails', { slug: projectSlug }]);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  if (projectQuery.status === 'loading') {
    return (
      <Section>
        <Flex stack gap="l">
          <H1>Project Settings</H1>
          <Spinner center />
        </Flex>
      </Section>
    );
  }

  if (projectQuery.status === 'error') {
    return <Section>Error while loading project</Section>;
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
                  {projectQuery.data.org.personalForUserId ? (
                    <>
                      <Link href="/organizations" passHref>
                        <TextLink stableId={StableId.PROJECT_SETTINGS_CREATE_ORGANIZATION_LINK}>
                          Create an organization
                        </TextLink>
                      </Link>{' '}
                      to collaborate with others. For now, you&apos;ll need to create a new project after creating the
                      organization.
                    </>
                  ) : (
                    <>
                      <Link href={`/organizations/${projectQuery.data.org.slug}`} passHref>
                        <TextLink stableId={StableId.PROJECT_SETTINGS_INVITE_ORGANIZATION_LINK}>
                          View your organization
                        </TextLink>
                      </Link>{' '}
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
        slug={projectQuery.data.slug}
        name={projectQuery.data.name}
        show={showModal}
        setShow={setShowModal}
        onDelete={() => router.push('/projects')}
      />
    </>
  );
};

ProjectSettings.getLayout = useDashboardLayout;

export default withSelectedProject(ProjectSettings);
