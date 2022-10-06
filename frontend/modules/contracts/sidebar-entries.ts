import type { SidebarEntry } from '@/shared/utils/types';
import { StableId } from '@/utils/stable-ids';

const entries: SidebarEntry[] = [
  {
    display: 'Contracts',
    route: `/contracts`,
    routeMatchPattern: '/contracts',
    icon: 'zap',
    stableId: StableId.SIDEBAR_CONTRACTS_LINK,
  },
];

export default entries;
