import type { Api } from '@pc/common/types/api';
import { useCallback } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { Spinner } from '@/components/lib/Spinner';
import { SubnetIcon } from '@/components/lib/SubnetIcon';
import { useMaybeProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

interface Props {
  onChange: (callback: () => void) => void;
}

export function EnvironmentSelector({ onChange }: Props) {
  const { projectSlug, environmentSubId, updateContext: updateProjectContext } = useMaybeProjectContext();
  const environmentsQuery = useQuery(['/projects/getEnvironments', { project: projectSlug || 'unknown' }], {
    enabled: Boolean(projectSlug),
  });

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
    environmentsQuery.data && environmentSubId
      ? environmentsQuery.data.find((environment) => environment.subId === environmentSubId)
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
        {environmentsQuery.data ? (
          environmentsQuery.data.map((e) => {
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
