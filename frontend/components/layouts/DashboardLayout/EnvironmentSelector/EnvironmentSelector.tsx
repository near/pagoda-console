import type { Api } from '@pc/common/types/api';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { SubnetIcon } from '@/components/lib/SubnetIcon';
import { useProjectSelector, useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

interface Props {
  onBeforeChange?: (change: () => void) => void;
}

export function EnvironmentSelector(props: Props) {
  const { environment, environments, project } = useSelectedProject({ enforceSelectedProject: false });
  const { selectEnvironment } = useProjectSelector();

  function onSelectEnvironment(environment: Environment) {
    if (!project) return;

    if (props.onBeforeChange) {
      props.onBeforeChange(() => {
        selectEnvironment(project.slug, environment.subId);
        analytics.track('DC Switch Network');
      });
      return;
    }

    selectEnvironment(project.slug, environment.subId);
    analytics.track('DC Switch Network', {
      status: 'success',
      net: environment.net,
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button
        stableId={StableId.ENVIRONMENT_SELECTOR_DROPDOWN}
        css={{
          height: 'auto',
          padding: '0 var(--space-s)',
          width: '10rem',
          '@tablet': {
            width: 'auto',
          },
        }}
        hideText="tablet"
      >
        <SubnetIcon net={environment?.net} />
        {environment?.name || '...'}
      </DropdownMenu.Button>

      <DropdownMenu.Content>
        {environments?.map((e) => {
          return (
            <DropdownMenu.Item key={e.subId} onSelect={() => onSelectEnvironment(e)}>
              <SubnetIcon net={e.net} />
              {e.name}
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
