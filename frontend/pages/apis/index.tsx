import Link from 'next/link';

import { AuthStatusRenderer } from '@/components/AuthStatusRenderer';
import { Badge } from '@/components/lib/Badge';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Section } from '@/components/lib/Section';
import * as Tabs from '@/components/lib/Tabs';
import { withSelectedProject } from '@/components/with-selected-project';
import { useDashboardLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { ApiKeys } from '@/modules/apis/components/ApiKeys';
import { ApisMarketing } from '@/modules/apis/components/ApisMarketing';
import { ApiStats } from '@/modules/apis/components/ApiStats';
import EnhancedApi from '@/modules/apis/components/EnhancedApi';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ListApis = withSelectedProject(() => {
  const activeTab = useRouteParam('tab', '?tab=keys', true);

  return (
    <Section>
      <Tabs.Root value={activeTab || ''}>
        <Tabs.List tabIndex={-1}>
          <Link href="?tab=keys" passHref>
            <Tabs.TriggerLink stableId={StableId.APIS_TABS_KEYS_LINK} active={activeTab === 'keys'}>
              <FeatherIcon icon="key" /> Keys
            </Tabs.TriggerLink>
          </Link>

          <Link href="?tab=statistics" passHref>
            <Tabs.TriggerLink stableId={StableId.APIS_TABS_STATISTICS_LINK} active={activeTab === 'statistics'}>
              <FeatherIcon icon="activity" /> Statistics
            </Tabs.TriggerLink>
          </Link>

          <Link href="?tab=enhancedApi" passHref>
            <Tabs.TriggerLink stableId={StableId.APIS_TABS_ENHANCED_API_LINK} active={activeTab === 'enhancedApi'}>
              <FeatherIcon icon="zap" />
              Enhanced API
            </Tabs.TriggerLink>
          </Link>

          <Tabs.Trigger stableId={StableId.APIS_TABS_EXPLORER_LINK} value="explorer" disabled>
            <FeatherIcon icon="search" />
            Explorer
            <Badge size="s">Soon</Badge>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="keys">
          <ApiKeys />
        </Tabs.Content>

        <Tabs.Content value="statistics">
          <ApiStats />
        </Tabs.Content>

        <Tabs.Content value="enhancedApi">
          <EnhancedApi />
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
});

const ListApisPage: NextPageWithLayout = () => {
  return <AuthStatusRenderer authenticated={<ListApis />} unauthenticated={<ApisMarketing />} />;
};

ListApisPage.getLayout = useDashboardLayout;

export default ListApisPage;
