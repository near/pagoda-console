import { useRouter } from 'next/router';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { useProjects } from '@/hooks/projects';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import type { Project } from '@/utils/types';

import { Badge } from '../lib/Badge';
import { FeatherIcon } from '../lib/FeatherIcon';

export function ProjectSelector() {
  const { project, selectProject } = useSelectedProject();
  const { projects } = useProjects();
  const router = useRouter();

  const otherProjectsList = projects && projects.filter((p) => p.slug !== project?.slug);
  const otherProjects = otherProjectsList?.length ? otherProjectsList : null;

  function onSelectProject(project: Project) {
    selectProject(project.slug);

    if (router.pathname.startsWith('/tutorials/') && !project.tutorial) {
      router.push('/project-analytics');
    }

    analytics.track('DC Switch Project');
  }

  function onSelectNewProject() {
    router.push('/pick-project');
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button color="outline">{project?.name}</DropdownMenu.Button>

      <DropdownMenu.Content align="start">
        {otherProjects?.map((p) => {
          return (
            <DropdownMenu.Item key={p.id} onSelect={() => onSelectProject(p)}>
              {p.name}

              {p.tutorial && <Badge size="small">Tutorial</Badge>}
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
