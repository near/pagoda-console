import type { SidebarEntry } from '@/components/layouts/DashboardLayout/Sidebar';
import { StableId } from '@/utils/stable-ids';

const entries: SidebarEntry[] = [
  {
    display: 'Deploys',
    route: `/deploys`,
    routeMatchPattern: '/deploys',
    icon: 'git-branch',
    badgeText: 'Beta',
    stableId: StableId.SIDEBAR_DEPLOYS_LINK,
  },
];

export default entries;
