import { AuthStatusRenderer } from '@/components/AuthStatusRenderer';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Section } from '@/components/lib/Section';
import * as Tabs from '@/components/lib/Tabs';
import { useDashboardLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { Alerts } from '@/modules/alerts/components/Alerts';
import { AlertsMarketing } from '@/modules/alerts/components/AlertsMarketing';
import { Destinations } from '@/modules/alerts/components/Destinations';
import { TriggeredAlerts } from '@/modules/alerts/components/TriggeredAlerts';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ListAlertsPage: NextPageWithLayout = () => {
  return <AuthStatusRenderer authenticated={<ListAlerts />} unauthenticated={<AlertsMarketing />} />;
};

function ListAlerts() {
  const { environment, project } = useSelectedProject();
  const activeTab = useRouteParam('tab', '?tab=alerts', true);

  return (
    <Section>
      <Tabs.Root value={activeTab || ''}>
        <Tabs.List>
          <Tabs.Trigger stableId={StableId.ALERTS_TABS_ACTIVITY_LINK} value="activity" href="?tab=activity">
            <FeatherIcon icon="list" /> Activity
          </Tabs.Trigger>

          <Tabs.Trigger stableId={StableId.ALERTS_TABS_ALERTS_LINK} value="alerts" href="?tab=alerts">
            <FeatherIcon icon="bell" /> Alerts
          </Tabs.Trigger>

          <Tabs.Trigger stableId={StableId.ALERTS_TABS_DESTINATIONS_LINK} value="destinations" href="?tab=destinations">
            <FeatherIcon icon="inbox" /> Destinations
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="activity">
          <TriggeredAlerts environment={environment} project={project} />
        </Tabs.Content>

        <Tabs.Content value="alerts">
          <Alerts environment={environment} project={project} />
        </Tabs.Content>

        <Tabs.Content value="destinations">
          <Destinations project={project} />
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
}

ListAlertsPage.getLayout = useDashboardLayout;

export default ListAlertsPage;
