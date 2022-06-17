import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import { assertUnreachable } from '@/utils/helpers';
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
      <DropdownMenu.Button css={{ width: '11rem' }}>
        <Icon environment={environment} />
        {environment?.name || '...'}
      </DropdownMenu.Button>

      <DropdownMenu.Content width="trigger">
        {environments?.map((e) => {
          return (
            <DropdownMenu.Item key={e.subId} onSelect={() => onSelectEnvironment(e)}>
              <Icon environment={e} />
              {e.name}
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function Icon({ environment }: { environment?: Environment }) {
  if (!environment) return null;

  switch (environment.net) {
    case 'MAINNET':
      return <FeatherIcon icon="layers" css={{ color: 'var(--color-mainnet)' }} />;
    case 'TESTNET':
      return <FeatherIcon icon="code" css={{ color: 'var(--color-testnet)' }} />;
    default:
      assertUnreachable(environment.net);
  }
}
