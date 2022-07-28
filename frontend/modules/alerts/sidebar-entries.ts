import type { SidebarEntry } from '@/shared/utils/types';

const entries: SidebarEntry[] = [
  { display: 'Alerts', route: `/alerts`, routeMatchPattern: '/alerts', icon: 'bell', badgeText: 'New!' },
];

export default entries;
