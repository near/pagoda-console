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
import { useMaybeProject, useProjectGroups } from '@/hooks/projects';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

interface Props {
  onChange: (callback: () => void) => void;
}

export function ProjectSelector({ onChange }: Props) {
  const { projectSlug, updateContext: updateProjectContext } = useMaybeProjectContext();
  const { project } = useMaybeProject(projectSlug);
  const { projectGroups } = useProjectGroups();
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
        <TextOverflow>{project ? project.name : '...'}</TextOverflow>
      </DropdownMenu.Button>

      <DropdownMenu.Content width="trigger" innerCss={{ padding: 0, borderRadius: 'inherit' }}>
        {projectGroups && projectGroups.length > 0 && (
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
                      key={project.slug}
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
        )}

        <Flex
          css={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--background-color)',
            padding: 'var(--space-s)',

            '&:not(:first-child)': {
              borderTop: 'solid 1px var(--color-border-1)',
            },
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
