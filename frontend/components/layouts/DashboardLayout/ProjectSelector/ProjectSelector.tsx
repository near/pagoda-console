import { useRouter } from 'next/router';

import { Badge } from '@/components/lib/Badge';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { useProjects } from '@/hooks/projects';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import type { Project } from '@/utils/types';

export function ProjectSelector() {
  const { project, selectProject } = useSelectedProject();
  const { projects } = useProjects();
  const router = useRouter();

  const otherProjectsList = projects && projects.filter((p) => p.slug !== project?.slug);
  const otherProjects = otherProjectsList?.length ? otherProjectsList : null;

  function onSelectProject(project: Project) {
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
      <DropdownMenu.Button css={{ width: '22rem' }}>
        <TextOverflow>{project?.name || '...'}</TextOverflow>
      </DropdownMenu.Button>

      <DropdownMenu.Content align="start">
        {otherProjects?.map((p) => {
          return (
            <DropdownMenu.Item key={p.id} onSelect={() => onSelectProject(p)}>
              {p.name}
              {p.tutorial && <Badge size="s">Tutorial</Badge>}
            </DropdownMenu.Item>
          );
        })}

        <DropdownMenu.Item onSelect={() => onSelectNewProject()} css={{ color: 'var(--color-primary)' }}>
          <FeatherIcon icon="plus-circle" />
          Create New Project
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
