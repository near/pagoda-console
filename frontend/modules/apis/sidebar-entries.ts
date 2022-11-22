import type { SidebarEntry } from '@/components/layouts/DashboardLayout/Sidebar';
import { StableId } from '@/utils/stable-ids';

const entries: SidebarEntry[] = [
  {
    display: 'APIs',
    route: `/apis`,
    routeMatchPattern: '/apis',
    icon: 'code',
    badgeText: 'Beta',
    stableId: StableId.SIDEBAR_APIS_LINK,
  },
];

export default entries;
