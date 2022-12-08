import { useRouter } from 'next/router';

import { Badge } from '@/components/lib/Badge';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { useProjectGroups } from '@/hooks/projects';
import { useProjectSelector, useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

interface Props {
  onBeforeChange?: (change: () => void) => void;
}

export function ProjectSelector(props: Props) {
  const { project } = useSelectedProject({ enforceSelectedProject: false });
  const { selectProject } = useProjectSelector();
  const { projectGroups } = useProjectGroups();
  const router = useRouter();

  function onSelectProject(project: NonNullable<typeof projectGroups>[number][1][number]) {
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
      <DropdownMenu.Button
        stableId={StableId.PROJECT_SELECTOR_DROPDOWN}
        css={{
          height: 'auto',
          padding: '0 var(--space-s)',
          width: '20rem',
          '@tablet': {
            width: 'auto',
          },
        }}
        hideText="tablet"
      >
        <FeatherIcon icon="box" />
        <TextOverflow>{project?.name || '...'}</TextOverflow>
      </DropdownMenu.Button>

      <DropdownMenu.Content>
        {projectGroups && projectGroups.length > 0 && (
          <>
            {projectGroups?.map(([orgName, projects]) => {
              return (
                <div key={orgName}>
                  <DropdownMenu.ContentItem css={{ paddingBottom: 0 }}>
                    <Text size="bodySmall" color="text3" css={{ textTransform: 'uppercase' }}>
                      {orgName}
                    </Text>
                  </DropdownMenu.ContentItem>
                  {projects.map((p) => (
                    <DropdownMenu.Item key={p.slug} onSelect={() => onSelectProject(p)}>
                      {project?.slug === p.slug ? (
                        <FeatherIcon icon="check-circle" size="xs" color="primary" />
                      ) : (
                        <FeatherIcon icon="circle" size="xs" color="text3" />
                      )}
                      {p.name}
                      {p.tutorial && <Badge size="s">Tutorial</Badge>}
                    </DropdownMenu.Item>
                  ))}
                </div>
              );
            })}
          </>
        )}

        <DropdownMenu.ContentStickyFooter>
          <DropdownMenu.Item color="primary" onSelect={() => onSelectNewProject()}>
            <FeatherIcon icon="plus" />
            Create New Project
          </DropdownMenu.Item>
        </DropdownMenu.ContentStickyFooter>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
