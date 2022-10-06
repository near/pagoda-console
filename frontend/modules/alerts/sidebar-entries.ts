import type { SidebarEntry } from '@/shared/utils/types';
import { StableId } from '@/utils/stable-ids';

const entries: SidebarEntry[] = [
  {
    display: 'Alerts',
    route: `/alerts`,
    routeMatchPattern: '/alerts',
    icon: 'bell',
    stableId: StableId.SIDEBAR_ALERTS_LINK,
  },
];

export default entries;
