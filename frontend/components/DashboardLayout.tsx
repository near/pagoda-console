import Link from 'next/link'
import { useRouter } from 'next/router';

import NearIcon from '../public/brand/near_icon.svg'
import { useDisplayName, useRouteParam } from '../utils/hooks';
import { getAuth, getIdToken } from 'firebase/auth';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Tooltip, Overlay, Placeholder } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';

import Gradient from '../public/dashboardGradient.svg';
import { logOut } from '../utils/auth';
import { useProject } from '../utils/fetchers';

interface PageDefinition {
    display: string,
    route: string,
    routeMatchPattern?: string,
    debug?: boolean
};

// We may change which pages display depending on the type of project.
function useProjectPages(): PageDefinition[] {
    const pages = [];

    const projectSlug = useRouteParam('project');
    const { project, error: projectError } = useProject(projectSlug);

    if (project?.tutorial === 'NFT_MARKET') {
        pages.push({ display: 'Tutorial', route: '/tutorials/nfts/overview', routeMatchPattern: '/tutorials/' });
    }

    // If custom outline is injected, use that, else use this.
    pages.push({ display: 'Analytics', route: '/analytics' });
    pages.push({ display: 'Contracts', route: `/contracts` });
    pages.push({ display: 'Settings', route: `/project-settings` });

    return pages;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter();

    return (
        <>
            <SideBar />
            <div className='gradientContainer'>
                <Gradient style={{ width: '100%', height: '100%', preserveAspectRatio: 'false' }} />
            </div>
            <div className='childContainer'>
                {children}
            </div>
            <style jsx>{`
            .childContainer {
                flex-grow: 1;
                max-width: 46rem;

                margin-left: calc(var(--layout-sidebar-width) + 7.5rem);
                margin-right: 7.5rem;
                padding-top: 3rem;
                padding-bottom: 3rem;
            }
            .gradientContainer {
                height: 100%;
                z-index: -1;
                left: -5rem;
                position: fixed;
            }
        `}</style>
        </>
    );
}

function SideBar() {
    const router = useRouter();
    const displayName = useDisplayName();
    const pages = useProjectPages();

    const isOnboardingRaw = useRouteParam('onboarding');
    const isOnboarding = (isOnboardingRaw === 'true');

    const project = useRouteParam('project');
    const environment = useRouteParam('environment');

    function dismissOnboarding() {
        router.replace(`${router.pathname}?project=${project}`, undefined, { shallow: true });
    }

    function createLink(route: string): string {
        let linkOut = route;
        if (typeof project === 'string' && typeof environment === 'string') {
            linkOut += `?project=${project}&environment=${environment}`;
        }
        return linkOut;
    }

    function isLinkSelected(page: PageDefinition): boolean {
        const matchesPattern = page.routeMatchPattern ? router.pathname.startsWith(page.routeMatchPattern) : false;
        return router.pathname === page.route || matchesPattern;
    }

    return (
        <div className='sidebar'>
            {/* <div className='logoContainer' onClick={() => getIdToken(getAuth().currentUser!).then((token) => navigator.clipboard.writeText(token).then(() => alert('Copied token to clipboard')))}> */}
            <div className='logoContainer'>
                <NearIcon />
            </div>
            <div className='linkContainer'>
                {pages.map((page, index) => <PageLink key={page.route} page={page} link={createLink(page.route)} isSelected={isLinkSelected(page)} isFirst={index === 0} isOnboarding={isOnboarding} dismissOnboarding={dismissOnboarding} />)}
            </div>
            <div className='footerContainer'>
                <Link href={createLink('/settings')}><a className='footerItem' >{displayName || <Placeholder animation='glow'><Placeholder size='sm' style={{ borderRadius: '0.5em', width: '100%' }} /></Placeholder>}</a></Link>
                <div className='footerItem borderTop' onClick={logOut}>Log Out</div>
            </div>
            <style jsx>{`
                .tempButtons {
                    margin-top: 2rem;
                    display: flex;
                    flex-direction: column;
                    row-gap: 0.25rem;
                }
                .sidebar {
                    display: flex;
                    flex-direction: column;
                    /*height: 100vh;*/
                    height: 100%;
                    left: 0;
                    top: 0;
                    width: var(--layout-sidebar-width);
                    background-color: var(--color-bg-primary);
                    align-items: center;
                    padding-top: 3rem;
                    position: fixed;
                }
                .logoContainer {
                    width: 2.625rem;
                }
                .linkContainer {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    margin-top: 3.5rem;
                    padding: 0 1rem 0;
                    flex-grow: 1;
                }
                .footerContainer {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    width: 100%;
                    background-color: #F2F2F2;
                    padding: 0 1rem 0;
                }
                .footerItem {
                    padding: 1rem 0 1rem;
                    cursor: pointer;
                    text-decoration: none;
                }
                .footerItem:hover {
                    color: var(--color-primary)
                }
                .borderTop {
                    border-top: 1px solid #ABB5BE;
                }
            `}</style>
        </div>
    );
}

function PageLink(props: { page: PageDefinition, isSelected?: boolean, isFirst?: boolean, link: string, isOnboarding: boolean, dismissOnboarding?: () => void }) {
    // NOTE: this displayed a tooltip to direct the user into the settings page to find their API keys. It was decided
    // to instead show the API keys directly on the empty state of the analytics page. Leaving this here in for the
    // short term until that it implemented
    //
    // const [hideTooltip, setHideTooltip] = useState<boolean>(false);
    // function closeTooltip() {
    //     // setHideTooltip(true);
    //     if (props.dismissOnboarding) {
    //         props.dismissOnboarding();
    //     }
    // }
    // const target = useRef(null);
    // const popover = props.page.display === 'Settings' ? (
    //     <Overlay target={target.current} popperConfig={{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }} show={props.isOnboarding && !hideTooltip} placement="right" rootClose={true} onHide={closeTooltip}>
    //         {(props) => (
    //             <Tooltip {...props} >
    //                 Find your new API keys here!
    //             </Tooltip>
    //         )}
    //     </Overlay>
    // ) : <></>;

    return (
        <div className='linkContainer'>
            <Link href={props.link}>
                {/* <a ref={target}>{props.page.display}</a> */}
                <a>{props.page.display}</a>
            </Link>
            {/* {popover} */}
            <style jsx>{`
                a {
                    font-size: 1.125rem;
                    text-decoration: none;
                    color: var(--color-text-primary);
                }
                a:hover {
                    filter: brightness(3);
                }
            `}</style>
            <style jsx>{`
                a {
                    font-weight: ${props.isSelected ? '800' : '500'};
                }
                .linkContainer {
                    padding: 1rem 0rem 1rem;
                    border-top: ${!props.isFirst && '1px solid #ABB5BE'}
                }
            `}</style>
        </div>
    );
}