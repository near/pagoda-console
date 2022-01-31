import { useEffect, useState } from 'react';
import { useSimpleLayout } from "../utils/layouts"
import { Button, Row, Col, Card } from 'react-bootstrap'
import { useRouter } from 'next/router';
import { useRouteParam } from '../utils/hooks';
import { logOut } from '../utils/auth';
import BackButton from '../components/BackButton';
import ProjectCard from '../components/ProjectCard';

const projects = [
    { title: 'Blank', image: 'static/images/blank.png', path: '/new-project' },
    { title: 'Tutorial', image: 'static/images/builder.png', path: '/pick-tutorial' }
]

export default function PickProject() {
    const router = useRouter();

    useEffect(() => {
        projects.forEach(p => router.prefetch(p.path));
        // It is not expected for the list of projects or the router to change during runtime.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isOnboarding = useRouteParam('onboarding');

    return <div className='newProjectContainer'>
        <h1 className="pageTitle">New Project</h1>
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
                    <ProjectCard path={project.path} image={project.image} title={project.title} onClick={() => router.push(project.path)} />
                </Col>
            ))}
        </Row>
        {/* // TODO adding a back button here might require having a stack to store a history of paths instead of just the last path */}
        {/* {!isOnboarding && <BackButton />} */}
        {isOnboarding && <div className='signOut'><Button variant="outline-secondary" onClick={logOut}>Log Out</Button></div>}
        <style jsx>{`
            .pageTitle {
                text-align: center;
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