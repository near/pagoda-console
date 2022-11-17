import Link from 'next/link';

import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Section } from '@/components/lib/Section';
import * as Tabs from '@/components/lib/Tabs';
import { withSelectedProject } from '@/components/with-selected-project';
import { useDashboardLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { Alerts } from '@/modules/alerts/components/Alerts';
import { Destinations } from '@/modules/alerts/components/Destinations';
import { TriggeredAlerts } from '@/modules/alerts/components/TriggeredAlerts';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ListAlerts: NextPageWithLayout = () => {
  const activeTab = useRouteParam('tab', '?tab=alerts', true);

  return (
    <Section>
      <Tabs.Root value={activeTab || ''}>
        <Tabs.List tabIndex={-1}>
          <Link href="?tab=activity" passHref>
            <Tabs.TriggerLink stableId={StableId.ALERTS_TABS_ACTIVITY_LINK} active={activeTab === 'activity'}>
              <FeatherIcon icon="list" /> Activity
            </Tabs.TriggerLink>
          </Link>

          <Link href="?tab=alerts" passHref>
            <Tabs.TriggerLink stableId={StableId.ALERTS_TABS_ALERTS_LINK} active={activeTab === 'alerts'}>
              <FeatherIcon icon="bell" /> Alerts
            </Tabs.TriggerLink>
          </Link>

          <Link href="?tab=destinations" passHref>
            <Tabs.TriggerLink stableId={StableId.ALERTS_TABS_DESTINATIONS_LINK} active={activeTab === 'destinations'}>
              <FeatherIcon icon="inbox" /> Destinations
            </Tabs.TriggerLink>
          </Link>
        </Tabs.List>

        <Tabs.Content value="activity">
          <TriggeredAlerts />
        </Tabs.Content>

        <Tabs.Content value="alerts">
          <Alerts />
        </Tabs.Content>

        <Tabs.Content value="destinations">
          <Destinations />
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
};

ListAlerts.getLayout = useDashboardLayout;

export default withSelectedProject(ListAlerts);
