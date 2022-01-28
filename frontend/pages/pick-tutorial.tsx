import { useEffect, useState } from 'react';
import { useSimpleLayout } from "../utils/layouts"
import { Button, Row, Col, Card } from 'react-bootstrap'
import { useRouter } from 'next/router';
import { useRouteParam } from '../utils/hooks';
import { logOut } from '../utils/auth';
import BackButton from '../components/BackButton';
import ProjectCard from '../components/ProjectCard';

const projects = [
    { title: 'NFT Market', image: 'static/images/blank.png', path: '/nft-market-tutorial' },
    { title: 'Crossword', image: 'static/images/builder.png' }
]

export default function PickProject() {
    const router = useRouter();

    useEffect(() => {
        router.prefetch('/nft-market-tutorial');
    }, []);

    const isOnboarding = useRouteParam('onboarding');

    return <div className='newProjectContainer'>
        <h1 className="pageTitle">Select Tutorial</h1>
        <Row xs={1} md={2} className="g-4">
            {projects.map((project, idx) => (
                <Col key={idx}>
                    <ProjectCard path={project.path} image={project.image} title={project.title} />
                </Col>
            ))}
        </Row>
        {/* {!isOnboarding && <BackButton />} */}
        {isOnboarding && <div className='signOut'><Button variant="outline-secondary" onClick={logOut}>Log Out</Button></div>}
        <style jsx>{`
            .pageTitle {
                text-align: center;
                margin-bottom: 2rem;
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