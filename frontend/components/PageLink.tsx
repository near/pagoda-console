import Link from 'next/link';
import { ReactNode } from 'react';
import { useRouteParam } from '../utils/hooks';

export default function PageLink({ route, children }: { route: string, children: ReactNode }) {
    const project = useRouteParam('project');
    const environment = useRouteParam('environment');
    return <Link href={`${route}?project=${project}&environment=${environment}`}>
        <a>{children}</a>
    </Link>;
}