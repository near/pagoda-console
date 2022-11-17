import type { Api } from '@pc/common/types/api';
import { useCallback } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { Spinner } from '@/components/lib/Spinner';
import { SubnetIcon } from '@/components/lib/SubnetIcon';
import { useEnvironments } from '@/hooks/environments';
import { useMaybeProjectContext } from '@/hooks/project-context';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

interface Props {
  onChange: (callback: () => void) => void;
}

export function EnvironmentSelector({ onChange }: Props) {
  const { projectSlug, environmentSubId, updateContext: updateProjectContext } = useMaybeProjectContext();
  const { environments } = useEnvironments(projectSlug);

  const onSelectEnvironment = useCallback(
    (environment: Environment) => {
      if (!projectSlug) {
        return;
      }
      onChange(() => {
        updateProjectContext(projectSlug, environment.subId);
        analytics.track('DC Switch Network', {
          status: 'success',
          net: environment.net,
        });
      });
    },
    [onChange, updateProjectContext, projectSlug],
  );

  const selectedEnvironment =
    environments && environmentSubId
      ? environments.find((environment) => environment.subId === environmentSubId)
      : undefined;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button stableId={StableId.ENVIRONMENT_SELECTOR_DROPDOWN} css={{ width: '11rem', height: 'auto' }}>
        {!selectedEnvironment ? (
          '...'
        ) : (
          <>
            <SubnetIcon net={selectedEnvironment.net} />
            {selectedEnvironment.name}
          </>
        )}
      </DropdownMenu.Button>

      <DropdownMenu.Content width="trigger">
        {environments ? (
          environments.map((e) => {
            return (
              <DropdownMenu.Item key={e.subId} onSelect={() => onSelectEnvironment(e)}>
                <SubnetIcon net={e.net} />
                {e.name}
              </DropdownMenu.Item>
            );
          })
        ) : (
          <Spinner size="s" />
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
