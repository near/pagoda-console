// Add entries to the exported array to create page links in the side bar.
//
// If added entries do not appear, this file may not be getting pulled into
// the Sidebar component. Please notify the DevConsole main team as that
// is usually configured during module onboarding
//
// Available icons: https://feathericons.com/

import type { SidebarEntry } from '@/shared/utils/types';
import { StableId } from '@/utils/stable-ids';

const entries: SidebarEntry[] = [
  //e.g. { display: 'Security', route: `/security`, icon: 'lock' },
  { display: 'Indexers', route: `/indexers`, icon: 'database', stableId: StableId.SIDEBAR_INDEXERS_LINK },
];

// uses default export instead of named export to avoid collisions when
// importing
export default entries;
