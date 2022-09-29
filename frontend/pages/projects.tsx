import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1, H4 } from '@/components/lib/Heading';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useProjectGroups } from '@/hooks/projects';
import DeleteProjectModal from '@/modules/core/components/modals/DeleteProjectModal';
import { useSettingsStoreForUser } from '@/stores/settings';
import type { Project } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

const Projects: NextPageWithLayout = () => {
  const router = useRouter();
  const { projectGroups, error, isValidating, mutate: refetchProjects } = useProjectGroups();
  const [isEditing, setIsEditing] = useState(false);
  const [showRedirectAlert, setShowRedirectAlert] = useState(false);
  const { settingsInitialized, updateSettings } = useSettingsStoreForUser();

  useEffect(() => {
    if (window.sessionStorage.getItem('redirected') === 'true') {
      setShowRedirectAlert(true);
      window.sessionStorage.removeItem('redirected');
    }

    router.prefetch('/pick-project');
  }, [router]);

  useEffect(() => {
    if (settingsInitialized && showRedirectAlert) {
      updateSettings({
        selectedProjectSlug: undefined,
      });
    }
    // TODO: Adding updateSettings to dep array causes infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRedirectAlert, settingsInitialized]);

  useEffect(() => {
    if (!error && projectGroups && projectGroups.length === 0 && !isValidating && !showRedirectAlert) {
      router.push('/pick-project?onboarding=true');
    }
  }, [router, error, projectGroups, isValidating, showRedirectAlert]);

  return (
    <Container size="s">
      <Flex stack gap="l">
        <Flex justify="spaceBetween">
          <H1
            css={{
              marginRight: 'auto',
            }}
          >
            Projects
          </H1>

          <Button onClick={() => router.push('/pick-project')}>Create</Button>
          <Button onClick={() => setIsEditing(!isEditing)}>{!isEditing ? 'Edit' : 'Done'}</Button>
        </Flex>

        {error && <Message type="error" content="An error occurred." />}

        {showRedirectAlert && (
          <Message
            content="That project does not exist or you don't have permission to access it."
            color="danger"
            dismiss={() => setShowRedirectAlert(false)}
          />
        )}

        {projectGroups ? (
          <Flex stack gap="none" align="stretch">
            {projectGroups.map(([orgName, projects], i) => (
              <div key={orgName}>
                <Text css={{ padding: '12px 0', borderBottom: '1px solid var(--color-surface-5)' }}>{orgName}</Text>
                <Flex stack css={{ paddingLeft: 12 }}>
                  {projects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      showDelete={isEditing}
                      isTop={i === 0}
                      onDelete={() => refetchProjects()}
                    />
                  ))}
                </Flex>
              </div>
            ))}
          </Flex>
        ) : (
          <Spinner center />
        )}
      </Flex>
    </Container>
  );
};

function ProjectRow(props: { project: Project; showDelete: boolean; isTop: boolean; onDelete: () => void }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <Flex
      justify="spaceBetween"
      align="center"
      css={{
        borderBottom: '1px solid var(--color-surface-5)',
        padding: 'var(--space-m) 0',
      }}
    >
      <DeleteProjectModal
        slug={props.project.slug}
        name={props.project.name}
        show={showModal}
        setShow={setShowModal}
        onDelete={props.onDelete}
      />

      <Link href={`/contracts?project=${props.project.slug}`} passHref>
        <H4
          as="a"
          css={{
            display: 'block',
            width: '100%',
            transition: 'var(--transitions)',
            '&:hover': {
              color: 'var(--color-primary)',
            },
            '&:focus': {
              outline: 'var(--focus-outline)',
              outlineOffset: 'var(--focus-outline-offset)',
            },
          }}
        >
          <Flex justify="spaceBetween" align="center">
            <Flex align="center">
              {props.project.name}
              {props.project.tutorial && <Badge>Tutorial</Badge>}
            </Flex>

            {!props.showDelete && <FeatherIcon icon="chevrons-right" size="m" />}
          </Flex>
        </H4>
      </Link>

      {props.showDelete && (
        <Button size="s" color="danger" onClick={() => setShowModal(true)}>
          <FeatherIcon icon="trash-2" size="xs" />
        </Button>
      )}
    </Flex>
  );
}

Projects.getLayout = useSimpleLogoutLayout;

export default Projects;
