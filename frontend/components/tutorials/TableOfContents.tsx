import { useRouter } from "next/router";
import { useEffect } from "react";
import { useRouteParam } from "../../utils/hooks";

interface Route {
    label: string;
    path: string;
    children?: Route[]
}

const BASE_PATH = '/tutorials/nfts';
const ROUTES: Route[] = [
    {
        label: 'Overview',
        path: '/introduction',
        children: [
            {
                label: 'Prerequisites',
                path: '#prerequisites',
            },
            {
                label: 'Overview',
                path: '#overview',
            },
            {
                label: 'Next steps',
                path: '#next-steps',
            }
        ]
    },
    {
        label: '1. Pre-deployed Contract',
        path: '/predeployed-contract',
        children: [
            {
                label: 'Prerequisites',
                path: '#prerequisites',
            },
            {
                label: 'Using the NFT contract',
                path: '#using-the-nft-contract',
                children: [
                    {
                        label: 'Setup',
                        path: '#setup'
                    },
                    {
                        label: 'Minting your NFTs',
                        path: '#minting-your-nfts'
                    }
                ]
            },
            {
                label: 'Final remarks',
                path: '#final-remarks',
            }
        ]
    },
    {
        label: '2. Contract Architecture',
        path: '/skeleton',
        children: [
            {
                label: 'Introduction',
                path: '#introduction',
            },
            {
                label: 'File structure',
                path: '#file-structure',
                children: [
                    {
                        label: 'Source files',
                        path: '#source-files'
                    }
                ]
            },
            {
                label: 'approval.rs',
                path: '#approvalrs',
            },
            {
                label: 'enumeration.rs',
                path: '#enumerationrs'
            },
            {
                label: 'lib.rs',
                path: '#librs'
            },
            {
                label: 'metadata.rs',
                path: '#metadatars'
            },
            {
                label: 'mint.rs',
                path: '#mintrs'
            },
            {
                label: 'nft_core.rs',
                path: '#nft_corers'
            },
            {
                label: 'royalty.rs',
                path: '#royaltyrs'
            },
            {
                label: 'Building the skeleton',
                path: '#building-the-skeleton'
            },
            {
                label: 'Conclusion',
                path: '#conclusion'
            }
        ]
    }
];

function RouteList({ routes }: { routes: Route[] }) {
    return <ul>
        {routes.map(route => <RouteItem key={route.path} route={route} />)}
    </ul>
}

function RouteItem({ route }: { route: Route }) {
    const router = useRouter();
    const project = useRouteParam('project');
    let path;
    if (route.path.startsWith('#')) {
        path = route.path;
    } else {
        path = `${BASE_PATH}${route.path}?project=${project}&environment=1`;
    }

    const isCurrentRoute = router.pathname.startsWith(`${BASE_PATH}${route.path}`);

    return <>
        <li>
            <a href={path}>{route.label}</a>
            {isCurrentRoute && route.children && <RouteList routes={route.children} />}
        </li>
        <style jsx>{`
            a {
                text-decoration: none;
            }
        `}</style>
    </>;
}

export default function TableOfContents() {
    const router = useRouter();

    // Prefetch top-level pages.
    useEffect(() => {
        ROUTES.forEach(route => {
            router.prefetch(route.path);
        });
    }, []);

    // TODO make this component dynamic based on tutorial project
    return <>
        <div className="routeWrapper">
            <RouteList routes={ROUTES} />
        </div>
        <style jsx>{`
            .routeWrapper {
                border-left: 1px solid #ABB5BE;
                font-size: 1rem;
                text-decoration: none;
                position: absolute;
                top: 5rem;
                min-width: 5rem;
                left: calc(var(--layout-sidebar-width) + 7.5rem + 46rem + 2rem);
            }
            .routeWrapper :global(ul) {
                list-style-type: none;
            }
            .routeWrapper :global(ul) :global(ul) {
                color: var(--color-primary);
                padding-left: 1rem;
            }
        `}</style>
    </>;
}