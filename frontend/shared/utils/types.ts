import type { StableId } from '@/utils/stable-ids';

export interface SidebarEntry {
  display: string;
  icon: string;
  route: string;
  routeMatchPattern?: string;
  badgeText?: string;
  stableId: StableId;
}
