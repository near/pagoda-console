import { useEffect, useState } from 'react';
import { useSimpleLayout } from "../utils/layouts"
import { Button, Row, Col, Card } from 'react-bootstrap'
import { useRouter } from 'next/router';
import { useRouteParam } from '../utils/hooks';
import { logOut } from '../utils/auth';
import BackButton from '../components/BackButton';

const projects = [
    { title: 'Blank', image: 'static/images/blank.png', path: '/new-project' },
    { title: 'Tutorial', image: 'static/images/builder.png', path: '/nft-market-tutorial' }
]

export default function PickProject() {
    const router = useRouter();

    useEffect(() => {
        router.prefetch('/new-project');
        router.prefetch('/nft-market-tutorial');
    }, []);

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

        <Row xs={1} md={2} className="g-4">
            {projects.map((project, idx) => (
                <Col key={idx}>
                    <div className="projectCardWrapper">
                        <Card onClick={() => router.push(project.path)}>
                            <Card.Img variant="top" src={project.image} />
                            <Card.Body>
                                <Card.Title>{project.title + ' >>'}</Card.Title>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            ))}
        </Row>
        {!isOnboarding && <BackButton />}
        {isOnboarding && <div className='signOut'><Button variant="outline-secondary" onClick={logOut}>Log Out</Button></div>}
        <style jsx>{`
            .projectCardWrapper {
                cursor: pointer;
            }
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