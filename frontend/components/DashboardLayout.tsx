import Link from 'next/link'
import { useRouter } from 'next/router';

import NearIcon from '../public/brand/near_icon.svg'
import { useIdentity, useRouteParam } from '../utils/hooks';
import { getAuth, signOut, getIdToken } from 'firebase/auth';
import { NextPageWithLayout } from '../pages/_app';

import Gradient from '../public/dashboardGradient.svg';

interface PageDefinition {
    display: string,
    route: string
};

const pages = [
    { display: 'Home', route: '/home' },
    { display: 'Contracts', route: `/contracts` },
    { display: 'Projects', route: '/projects' },
    { display: 'New Project', route: '/new-project' },
];

export default function DashboardLayout({ children }: { children: NextPageWithLayout }) {
    const project = useRouteParam('project');

    return (
        <div className='dashbaordContainer'>
            <SideBar project={project} />
            <div className='gradientContainer'>
                <Gradient style={{ width: '100%', height: '100%', preserveAspectRatio: 'false' }} />
            </div>
            <div className='childContainer'>
                {children}
            </div>
            <style jsx>{`
            .dashbaordContainer {
                display: flex;
                flex-direction: row;
                height: 100vh;
            }
            .childContainer {
                flex-grow: 1;
                /*temp*/
                /*border-left: 1px solid var(--color-light-gray);*/
                padding-left: 7.5rem;
                padding-right: 7.5rem;
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

    return (
        <div className='sidebar'>
            {/* TODO REMOVE CLICK HANDLER */}
            <div className='logoContainer' onClick={() => getIdToken(getAuth().currentUser!).then((token) => navigator.clipboard.writeText(token).then(() => alert('Copied token to clipboard')))}>
                <NearIcon />
            </div>
            <div className='linkContainer'>
                {pages.map((page, index) => <PageLink key={page.route} page={page} project={project} isSelected={router.pathname === page.route} isFirst={index === 0} />)}
            </div>
            <div className='footerContainer'>
                <Link href={`/settings${project ? `?project=${project}` : ''}`}><a className='footerItem' >{identity?.displayName || ''}</a></Link>
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
                    width: 11.125rem;
                    max-width: 11.125rem;
                    background-color: var(--color-bg-primary);
                    align-items: center;
                    padding-top: 3rem;
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

function PageLink(props: { page: PageDefinition, isSelected?: boolean, isFirst?: boolean, project: string | null }) {
    const linkOut = props.page.route + (typeof props.project === 'string' ? `?project=${props.project}` : '');
    return (
        <div className='linkContainer'>
            <Link href={linkOut}>
                <a>{props.page.display}</a>
            </Link>
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