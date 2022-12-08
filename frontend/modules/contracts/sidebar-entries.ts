import type { SidebarEntry } from '@/components/layouts/DashboardLayout/Sidebar';
import { StableId } from '@/utils/stable-ids';

const entries: SidebarEntry[] = [
  {
    display: 'Contracts',
    route: `/contracts`,
    routeMatchPattern: '/contracts',
    icon: 'zap',
    stableId: StableId.SIDEBAR_CONTRACTS_LINK,
    visibleForAuthPublicMode: true,
  },
];

export default entries;
