import Link from 'next/link';
import type { ReactNode } from 'react';

import { useRouteParam } from '@/utils/hooks';

export default function PageLink({ route, anchor, children }: { route: string; anchor?: string; children: ReactNode }) {
  const project = useRouteParam('project');
  const environment = useRouteParam('environment');
  return (
    <Link href={`${route}?project=${project}&environment=${environment}${anchor ? `#${anchor}` : ''}`}>
      <a>{children}</a>
    </Link>
  );
}
