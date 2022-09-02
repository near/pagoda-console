import Link from 'next/link';

import { Badge } from '@/components/lib/Badge';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Section } from '@/components/lib/Section';
import * as Tabs from '@/components/lib/Tabs';
import useFeatureFlag from '@/hooks/features';
import { useDashboardLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { ApiKeys } from '@/modules/apis/components/ApiKeys';
import { ApiStats } from '@/modules/apis/components/ApiStats';
import EnhancedApi from '@/modules/apis/components/EnhancedApi';
import { NewApiKeys } from '@/modules/apis/components/NewApiKeys';
import type { NextPageWithLayout } from '@/utils/types';

const ListApis: NextPageWithLayout = () => {
  const { environment, project } = useSelectedProject();
  const activeTab = useRouteParam('tab', '?tab=keys', true);

  return (
    <Section>
      <Tabs.Root value={activeTab || ''}>
        <Tabs.List tabIndex={-1}>
          {useFeatureFlag('apis-beta-module') ? (
            <Link href="?tab=keys" passHref>
              <Tabs.TriggerLink active={activeTab === 'keys'}>
                <FeatherIcon icon="key" /> Keys
              </Tabs.TriggerLink>
            </Link>
          ) : (
            <Link href="?tab=oldkeys" passHref>
              <Tabs.TriggerLink active={activeTab === 'oldkeys'}>
                <FeatherIcon icon="key" /> Keys
              </Tabs.TriggerLink>
            </Link>
          )}

          <Link href="?tab=statistics" passHref>
            <Tabs.TriggerLink active={activeTab === 'statistics'}>
              <FeatherIcon icon="activity" /> Statistics
            </Tabs.TriggerLink>
          </Link>

          <Link href="?tab=enhancedApi" passHref>
            <Tabs.TriggerLink active={activeTab === 'enhancedApi'}>
              <FeatherIcon icon="zap" />
              Enhanced API
            </Tabs.TriggerLink>
          </Link>

          <Tabs.Trigger value="explorer" disabled>
            <FeatherIcon icon="search" />
            Explorer
            <Badge size="s">Soon</Badge>
          </Tabs.Trigger>
        </Tabs.List>

        {useFeatureFlag('apis-beta-module') ? (
          <Tabs.Content value="keys">
            <NewApiKeys project={project} />
          </Tabs.Content>
        ) : (
          <Tabs.Content value="oldkeys">
            <ApiKeys project={project} />
          </Tabs.Content>
        )}

        <Tabs.Content value="statistics">
          <ApiStats project={project} environment={environment} />
        </Tabs.Content>

        <Tabs.Content value="enhancedApi">
          <EnhancedApi />
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
};

ListApis.getLayout = useDashboardLayout;

export default ListApis;
