import { useRouter } from 'next/router';

import { Badge } from '@/components/lib/Badge';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { useProjects } from '@/hooks/projects';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import type { Project } from '@/utils/types';

interface Props {
  onBeforeChange?: (change: () => void) => void;
}

export function ProjectSelector(props: Props) {
  const { project, selectProject } = useSelectedProject();
  const { projects } = useProjects();
  const projectGroups =
    projects?.reduce<Record<string, Project[]>>((acc, project) => {
      const orgName = project.org.isPersonal ? 'Personal' : project.org.name || 'unknown';
      if (!acc[orgName]) {
        acc[orgName] = [];
      }
      acc[orgName].push(project);
      return acc;
    }, {}) ?? {};
  const router = useRouter();

  function onSelectProject(project: Project) {
    if (props.onBeforeChange) {
      props.onBeforeChange(() => {
        selectProject(project.slug);
        analytics.track('DC Switch Project');
      });
      return;
    }

    selectProject(project.slug);

    if (router.pathname.startsWith('/tutorials/') && !project.tutorial) {
      router.push('/contracts');
    }

    analytics.track('DC Switch Project');
  }

  function onSelectNewProject() {
    router.push('/pick-project');
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button css={{ width: '22rem', height: 'auto' }}>
        <TextOverflow>{project?.name || '...'}</TextOverflow>
      </DropdownMenu.Button>

      <DropdownMenu.Content width="trigger" innerCss={{ padding: 0, borderRadius: 'inherit' }}>
        <Flex
          css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 'var(--space-m)',
            padding: 'var(--space-s)',
          }}
        >
          {Object.entries(projectGroups)?.map(([orgName, projects]) => {
            return (
              <div key={orgName}>
                <DropdownMenu.ContentItem css={{ paddingBottom: 0 }}>
                  <Text size="bodySmall" color="text3" css={{ textTransform: 'uppercase' }}>
                    {orgName}
                  </Text>
                </DropdownMenu.ContentItem>
                {projects.map((project) => (
                  <DropdownMenu.Item key={project.id} onSelect={() => onSelectProject(project)}>
                    {project.name}
                    {project.tutorial && <Badge size="s">Tutorial</Badge>}
                  </DropdownMenu.Item>
                ))}
              </div>
            );
          })}
        </Flex>

        <Flex
          css={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--background-color)',
            borderTop: 'solid 1px var(--color-border-1)',
            marginTop: 'var(--space-s)',
            padding: 'var(--space-s)',
          }}
        >
          <DropdownMenu.Item
            onSelect={() => onSelectNewProject()}
            css={{ color: 'var(--color-primary)', width: '100%' }}
          >
            <FeatherIcon icon="plus-circle" />
            Create New Project
          </DropdownMenu.Item>
        </Flex>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
