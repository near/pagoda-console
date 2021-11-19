import Link from 'next/link'
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';

import NearIcon from '../public/brand/near_icon.svg'
import { useIdentity } from '../utils/hooks';
import { getAuth, signOut, getIdToken } from 'firebase/auth';
// import ThemeToggle from './ThemeToggle';
import { ReactNode, useEffect, useState } from 'react';


export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className='dashbaordContainer'>
            <SideBar />
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
                border-left: 1px solid var(--color-light-gray);
                padding-left: 7.5rem;
                padding-right: 7.5rem;
                padding-top: 3rem;
            }
        `}</style>
        </div>
    );
}

interface PageDefinition {
    display: string,
    route: string
};

const pages = [
    { display: 'Home', route: '/project/[project]/home' },
    { display: 'Contracts', route: `/project/[project]/contracts` },
    { display: 'Projects', route: '/projects' },
    { display: 'New Project', route: '/new-project' },
];

function SideBar() {
    const router = useRouter();
    const identity = useIdentity();

    const { project: projectParam } = router.query;
    let project: string | null = null;

    if (projectParam && typeof projectParam === 'string') {
        project = projectParam;
    }

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
            <div className='logoContainer'>
                <NearIcon />
            </div>
            <div className='linkContainer'>
                {pages.map((page, index) => <PageLink key={page.route} page={page} project={project} isSelected={router.pathname === page.route} isFirst={index === 0} />)}
            </div>
            <div className='footerContainer'>
                <div className='footerContent'>{identity?.displayName || ''}</div>

                {/* temp */}
                <div className='tempButtons'>
                    <Button variant='neutral' onClick={signUserOut}>Sign Out</Button>
                    <Button variant='outline-neutral' onClick={() => getIdToken(getAuth().currentUser!).then((token) => navigator.clipboard.writeText(token).then(() => alert('Copied')))}>Copy token</Button>
                    {/* <ThemeToggle /> */}
                </div>
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
                    padding: 3rem 1rem 1rem 1rem;
                }
                .logoContainer {
                    width: 2.625rem;
                }
                .linkContainer {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    margin-top: 3.5rem;
                }
                .footerContainer {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    width: 100%;
                }
                .footerContent {
                    border-top: 1px solid #ABB5BE;
                    padding-top: 1rem;
                }
            `}</style>
        </div>
    );
}

function PageLink(props: { page: PageDefinition, isSelected?: boolean, isFirst?: boolean, project: string | null }) {
    const linkOut = typeof props.project === 'string' ? props.page.route.replace('[project]', props.project) : '';
    console.log(linkOut);
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