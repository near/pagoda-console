import { FormEvent, useEffect, useState } from 'react';
import { useSimpleLayout } from "../utils/layouts"
import { Button, Row, Col, Card, Alert } from 'react-bootstrap'
import { useRouter } from 'next/router';
import { useRouteParam } from '../utils/hooks';
import { logOut } from '../utils/auth';
import BackButton from '../components/BackButton';
import ProjectCard from '../components/ProjectCard';
import { authenticatedPost } from '../utils/fetchers';
import { Project } from '../utils/interfaces';
import mixpanel from 'mixpanel-browser';

enum Tutorial {
    NftMarket = 'NFT_MARKET',
    Crossword = 'CROSSWORD',
}

// Not including a path attribute will grey-out the tile and it will not be clickable.
const projects = [
    { tutorial: Tutorial.NftMarket, title: 'NFT Market', image: 'static/images/blank.png', path: '/tutorials/nfts/overview' },
    { tutorial: Tutorial.Crossword, title: 'Crossword', image: 'static/images/builder.png' },
];

export default function PickProject() {
    const router = useRouter();
    const isOnboarding = useRouteParam('onboarding');
    const [createInProgress, setCreateInProgress] = useState<boolean>(false);
    const [creationError, setCreationError] = useState<string>('');

    // Project name is tutorial name. Path is the mdx file for the tutorial.
    async function createProject(tutorial: Tutorial, name: string, path: string): Promise<void> {
        if (createInProgress) {
            return;
        }
        setCreateInProgress(true);
        try {
            router.prefetch(path);
            const project: Project = await authenticatedPost('/projects/create', { name, tutorial }, { forceRefresh: true });
            mixpanel.track('DC Create New Tutorial Project', {
                status: 'success',
                name,
            });
            router.push(`${path}?project=${project.slug}&environment=1`);
        } catch (e: any) {
            mixpanel.track('DC Create New Tutorial Project', {
                status: 'failure',
                name,
                error: e.message,
            });
            setCreationError('Something went wrong');
        } finally {
            setCreateInProgress(false);
        }
    }

    return <div className='newProjectContainer'>
        <h1 className="pageTitle">Select Tutorial</h1>
        <Row xs={1} md={2} className="g-4">
            {projects.map((project, idx) => (
                <Col key={idx}>
                    <ProjectCard path={project.path} image={project.image} title={project.title} onClick={() => project.path && createProject(project.tutorial, project.title, project.path)} />
                </Col>
            ))}
        </Row>
        {creationError && <div className='errorContainer'><Alert variant='danger'>{creationError}</Alert></div>}
        {/* {!isOnboarding && <BackButton />} */}
        {isOnboarding && <div className='signOut'><Button variant="outline-secondary" onClick={logOut}>Log Out</Button></div>}
        <style jsx>{`
            .pageTitle {
                text-align: center;
                margin-bottom: 2rem;
            }
            .errorContainer {
                margin-top: 1rem;
            }
            h1 {
                margin-bottom: 1.25rem;
                width: 100%
            }
            .calloutText {
                margin-bottom: 2rem;
                text-align: center;
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