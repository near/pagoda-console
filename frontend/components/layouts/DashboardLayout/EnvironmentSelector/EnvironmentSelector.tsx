import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { SubnetIcon } from '@/components/lib/SubnetIcon';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import type { Environment } from '@/utils/types';

interface Props {
  onBeforeChange?: (change: () => void) => void;
}

export function EnvironmentSelector(props: Props) {
  const { environment, environments, selectEnvironment } = useSelectedProject();

  function onSelectEnvironment(environment: Environment) {
    if (props.onBeforeChange) {
      props.onBeforeChange(() => {
        selectEnvironment(environment.subId);
        analytics.track('DC Switch Network');
      });
      return;
    }

    selectEnvironment(environment.subId);
    analytics.track('DC Switch Network', {
      status: 'success',
      net: environment.net,
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button css={{ width: '11rem', height: 'auto' }}>
        <SubnetIcon net={environment?.net} />
        {environment?.name || '...'}
      </DropdownMenu.Button>

      <DropdownMenu.Content width="trigger">
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
