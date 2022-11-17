import type { Api } from '@pc/common/types/api';
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
import { useQuery } from '@/hooks/query';
import DeleteProjectModal from '@/modules/core/components/modals/DeleteProjectModal';
import { getProjectGroups } from '@/utils/projects';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const Projects: NextPageWithLayout = () => {
  const router = useRouter();
  const projectsQuery = useQuery(['/projects/list']);
  const projectGroups = getProjectGroups(projectsQuery.data);
  const [isEditing, setIsEditing] = useState(false);
  const [showRedirectAlert, setShowRedirectAlert] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem('redirected') === 'true') {
      setShowRedirectAlert(true);
      window.sessionStorage.removeItem('redirected');
    }

    router.prefetch('/pick-project');
  }, [router]);

  useEffect(() => {
    if (
      projectsQuery.status !== 'error' &&
      projectGroups.length === 0 &&
      !projectsQuery.isLoading &&
      !showRedirectAlert
    ) {
      router.push('/pick-project?onboarding=true');
    }
  }, [router, projectsQuery, projectGroups.length, showRedirectAlert]);

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

          <Button stableId={StableId.PROJECTS_CREATE_PROJECT_LINK} onClick={() => router.push('/pick-project')}>
            Create
          </Button>
          <Button stableId={StableId.PROJECTS_EDIT_TOGGLE_BUTTON} onClick={() => setIsEditing(!isEditing)}>
            {!isEditing ? 'Edit' : 'Done'}
          </Button>
        </Flex>

        {projectsQuery.status === 'error' ? <Message type="error" content="An error occurred." /> : null}

        {showRedirectAlert && (
          <Message
            content="That project does not exist or you don't have permission to access it."
            color="danger"
            dismiss={() => setShowRedirectAlert(false)}
          />
        )}

        {projectsQuery.isLoading ? (
          <Flex stack gap="none" align="stretch">
            {projectGroups.map(([orgName, projects], i) => (
              <div key={orgName}>
                <Text css={{ padding: '12px 0', borderBottom: '1px solid var(--color-surface-5)' }}>{orgName}</Text>
                <Flex stack css={{ paddingLeft: 12 }}>
                  {projects.map((project) => (
                    <ProjectRow key={project.id} project={project} showDelete={isEditing} isTop={i === 0} />
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

type Project = Api.Query.Output<'/projects/list'>[number];

function ProjectRow(props: { project: Project; showDelete: boolean; isTop: boolean }) {
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
      <DeleteProjectModal slug={props.project.slug} name={props.project.name} show={showModal} setShow={setShowModal} />

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
        <Button
          stableId={StableId.PROJECTS_OPEN_DELETE_PROJECT_MODAL}
          size="s"
          color="danger"
          onClick={() => setShowModal(true)}
        >
          <FeatherIcon icon="trash-2" size="xs" />
        </Button>
      )}
    </Flex>
  );
}

Projects.getLayout = useSimpleLogoutLayout;

export default Projects;
