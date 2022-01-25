import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useSimpleLayout } from "../utils/layouts"
import { Form, Button } from 'react-bootstrap'
import { useRouter } from 'next/router';
import { Project } from '../utils/interfaces';
import { authenticatedPost } from '../utils/fetchers';
import { useRouteParam } from '../utils/hooks';
import mixpanel from 'mixpanel-browser';
import { logOut } from '../utils/auth';
import BorderSpinner from '../components/BorderSpinner';

// Don't show the back button if we are going back to these specific routes.
const EXCLUDED_BACK_PATHS = ['/register', '/verification'];

export default function PickProject() {
    const router = useRouter();

    let [lastVisitedPath, setLastVisitedPath] = useState<string>('');
    useEffect(() => {
        let path = window.sessionStorage.getItem("lastVisitedPath");

        // Don't show the back button if we will nav to this same page.
        if (path && path !== router.asPath && !EXCLUDED_BACK_PATHS.includes(path)) {
            setLastVisitedPath(path);
        }
        // The router path only needs to be verified once. Disabling eslint rule.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        router.prefetch('/pick-project');
        // TODO router.prefetch('/nft-market-tutorial');
    })

    const isOnboarding = useRouteParam('onboarding');

    return <div className='newProjectContainer'>
        <h1>New Project</h1>
        {isOnboarding && <div className='calloutText'>
            <span className='boldText'>One last thing! </span>
            Before we let you loose on the Developer Console, you’ll need to create a blank project or get some guidance with a tutorial. Projects contain API keys and any smart contracts you wish to track.
        </div>}
        {!isOnboarding && <div className='calloutText'>
            Start with a blank project or get some guidance with a tutorial.
        </div>}

        {isOnboarding && <div className='signOut'><Button variant="outline-secondary" onClick={logOut}>Log Out</Button></div>}
        <style jsx>{`
            .newProjectContainer {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 34rem;
                margin: 0 auto;
            }
            .newProjectContainer :global(.newProjectForm) {
                width: 100%;
            }
            .newProjectContainer :global(.formField) {
                margin-bottom: 1rem;
            }
            h1 {
                margin-bottom: 1.25rem;
                width: 100%
            }
            .calloutText {
                margin-bottom: 1rem;
            }
            .boldText {
                font-weight: 700;
            }
            .submitRow {
                width: 100%;
                display: flex;
                justify-content: flex-end;
            }
            .submitContainer {
                display: flex;
                flex-direction: row;
                column-gap: 1rem;
            }
            .signOut {
                position: absolute;
                left: 3rem;
                bottom: 3rem;
            }
        `}</style>
    </div >
}

PickProject.getLayout = useSimpleLayout;