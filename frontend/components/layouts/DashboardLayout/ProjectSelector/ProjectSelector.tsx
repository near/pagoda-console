import type { Projects } from '@pc/common/types/core';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { Badge } from '@/components/lib/Badge';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { useMaybeProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import analytics from '@/utils/analytics';
import { getProjectGroups } from '@/utils/projects';
import { StableId } from '@/utils/stable-ids';

interface Props {
  onChange: (callback: () => void) => void;
}

export function ProjectSelector({ onChange }: Props) {
  const { projectSlug, updateContext: updateProjectContext } = useMaybeProjectContext();
  const projectQuery = useQuery(['/projects/getDetails', { slug: projectSlug || 'unknown' }], {
    enabled: Boolean(projectSlug),
  });
  const projectsQuery = useQuery(['/projects/list']);
  const projectGroups = getProjectGroups(projectsQuery.data);
  const router = useRouter();

  const onSelectProject = useCallback(
    (projectSlug: Projects.ProjectSlug, isTutorial: boolean) => {
      onChange(() => {
        updateProjectContext(projectSlug, null);
        if (router.pathname.startsWith('/tutorials/') && !isTutorial) {
          router.push('/contracts');
        }
        analytics.track('DC Switch Project');
      });
    },
    [onChange, router, updateProjectContext],
  );

  function onSelectNewProject() {
    router.push('/pick-project');
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button stableId={StableId.PROJECT_SELECTOR_DROPDOWN} css={{ width: '22rem', height: 'auto' }}>
        <TextOverflow>{projectQuery.data ? projectQuery.data.name : '...'}</TextOverflow>
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
          {projectGroups?.map(([orgName, projects]) => {
            return (
              <div key={orgName}>
                <DropdownMenu.ContentItem css={{ paddingBottom: 0 }}>
                  <Text size="bodySmall" color="text3" css={{ textTransform: 'uppercase' }}>
                    {orgName}
                  </Text>
                </DropdownMenu.ContentItem>
                {projects.map((project) => (
                  <DropdownMenu.Item
                    key={project.id}
                    onSelect={() => onSelectProject(project.slug, Boolean(project.tutorial))}
                  >
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
