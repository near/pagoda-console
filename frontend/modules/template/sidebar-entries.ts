// Add entries to the exported array to create page links in the side bar.
//
// If added entries do not appear, this file may not be getting pulled into
// the Sidebar component. Please notify the DevConsole main team as that
// is usually configured during module onboarding
//
// Available icons: https://feathericons.com/

import type { SidebarEntry } from '@/shared/utils/types';

const entries: SidebarEntry[] = [
  //e.g. { display: 'Security', route: `/security`, icon: 'lock' },
];

// uses default export instead of named export to avoid collisions when
// importing
export default entries;
