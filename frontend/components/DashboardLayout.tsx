import Link from 'next/link'
import { useRouter } from 'next/router';

import NearIcon from '../public/brand/near_icon.svg'
import { useIdentity, useRouteParam } from '../utils/hooks';
import { getAuth, signOut, getIdToken } from 'firebase/auth';
import { ReactNode, useRef, useState } from 'react';
import { Tooltip, Overlay, Placeholder } from 'react-bootstrap';

import Gradient from '../public/dashboardGradient.svg';

interface PageDefinition {
    display: string,
    route: string,
    debug?: boolean
};

const pages = [
    { display: 'Analytics', route: '/analytics' },
    { display: 'Contracts', route: `/contracts` },
    { display: 'Settings', route: `/project-settings` },
    { display: 'Projects', route: '/projects', debug: true },
    { display: 'New Project', route: '/new-project', debug: true },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const project = useRouteParam('project');

    return (
        <div className='dashboardContainer'>
            <SideBar project={project} />
            <div className='gradientContainer'>
                <Gradient style={{ width: '100%', height: '100%', preserveAspectRatio: 'false' }} />
            </div>
            <div className='childContainer'>
                {children}
            </div>
            <style jsx>{`
            .dashboardContainer {
                display: flex;
                flex-direction: row;
                height: 100vh;
            }
            .childContainer {
                flex-grow: 1;
                /*temp*/
                max-width: 46rem;

                margin-left: calc(var(--layout-sidebar-width) + 7.5rem);
                margin-right: 7.5rem;
                padding-top: 3rem;
            }
            .gradientContainer {
                height: 100%;
                z-index: -1;
                left: -5rem;
                position: absolute;
            }
        `}</style>
        </div>
    );
}

function SideBar({ project }: { project: string | null }) {
    const router = useRouter();
    const identity = useIdentity();

    const isOnboardingRaw = useRouteParam('onboarding');
    const isOnboarding = (isOnboardingRaw === 'true');

    // TODO move to reusable location
    function signUserOut() {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
            // TODO
        }).catch((error) => {
            // An error happened.
            // TODO
        });
    }

    function dismissOnboarding() {
        router.replace(`${router.pathname}?project=${project}`, undefined, { shallow: true });
    }

    return (
        <div className='sidebar'>
            {/* TODO REMOVE CLICK HANDLER */}
            <div className='logoContainer' onClick={() => getIdToken(getAuth().currentUser!).then((token) => navigator.clipboard.writeText(token).then(() => alert('Copied token to clipboard')))}>
                <NearIcon />
            </div>
            <div className='linkContainer'>
                {pages.map((page, index) => <PageLink key={page.route} page={page} project={project} isSelected={router.pathname === page.route} isFirst={index === 0} isOnboarding={isOnboarding} dismissOnboarding={dismissOnboarding} />)}
            </div>
            <div className='footerContainer'>
                <Link href={`/settings${project ? `?project=${project}` : ''}`}><a className='footerItem' >{identity?.displayName || <Placeholder animation='glow'><Placeholder size='sm' style={{ borderRadius: '0.5em', width: '100%' }} /></Placeholder>}</a></Link>
                <div className='footerItem borderTop' onClick={signUserOut}>Logout</div>
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
                    height: 100%;
                    left: 0;
                    top: 0;
                    width: var(--layout-sidebar-width);
                    background-color: var(--color-bg-primary);
                    align-items: center;
                    padding-top: 3rem;
                    position: absolute;
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

function PageLink(props: { page: PageDefinition, isSelected?: boolean, isFirst?: boolean, project: string | null, isOnboarding: boolean, dismissOnboarding?: () => void }) {
    const linkOut = props.page.route + (typeof props.project === 'string' ? `?project=${props.project}` : '');
    const [hideTooltip, setHideTooltip] = useState<boolean>(false);

    const router = useRouter();
    function closeTooltip() {
        // setHideTooltip(true);
        if (props.dismissOnboarding) {
            props.dismissOnboarding();
        }
    }

    const target = useRef(null);
    const popover = props.page.display === 'Settings' ? (
        <Overlay target={target.current} popperConfig={{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }} show={props.isOnboarding && !hideTooltip} placement="right" rootClose={true} onHide={closeTooltip}>
            {(props) => (
                <Tooltip {...props} >
                    Find your new API keys here!
                </Tooltip>
            )}
        </Overlay>
    ) : <></>;

    return (
        <div className='linkContainer'>
            <Link href={linkOut}>
                <a ref={target}>{props.page.display}</a>
            </Link>
            {popover}
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
                    color: ${props.page.debug ? '#DEDEDE' : 'inherit'}
                }
                .linkContainer {
                    padding: 1rem 0rem 1rem;
                    border-top: ${!props.isFirst && '1px solid #ABB5BE'}
                }
            `}</style>
        </div>
    );
}