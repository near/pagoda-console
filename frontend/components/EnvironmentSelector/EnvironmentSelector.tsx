import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import { assertUnreachable } from '@/utils/helpers';
import type { Environment } from '@/utils/types';

import { FeatherIcon } from '../lib/FeatherIcon';

export function EnvironmentSelector() {
  const { environment, environments, selectEnvironment } = useSelectedProject();

  function onSelectEnvironment(environment: Environment) {
    selectEnvironment(environment.subId);
    analytics.track('DC Switch Network', {
      status: 'success',
      net: environment.net,
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button color="outline">
        <Icon environment={environment} /> {environment?.name}
      </DropdownMenu.Button>

      <DropdownMenu.Content align="start">
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
      return <FeatherIcon icon="layers" css={{ color: '#00BF89' }} />;
    case 'TESTNET':
      return <FeatherIcon icon="code" css={{ color: '#e9b870' }} />;
    default:
      assertUnreachable(environment.net);
  }
}
