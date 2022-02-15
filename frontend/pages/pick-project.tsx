import { useEffect } from 'react';
import { useSimpleLogoutLayout } from "../utils/layouts"
import { Row, Col } from 'react-bootstrap'
import { useRouter } from 'next/router';
import { useRouteParam } from '../utils/hooks';
import ProjectCard, { ProjectCardColor } from '../components/ProjectCard';

interface Project {
    title: string;
    path: string;
    description: string;
    color: ProjectCardColor;
}

const projects: Project[] = [
    { title: 'Blank', path: '/new-project', description: 'A blank project with mainnet and testnet API keys.', color: 'green' },
    { title: 'Tutorial', path: '/pick-tutorial', description: 'Choose from a variety of interactive tutorials.', color: 'orange' }
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
            One last thing! Before we let you loose on the Developer Console, you’ll need to create a blank project or get some guidance with a tutorial. Projects contain API keys and any smart contracts you wish to track.
        </div>}
        {!isOnboarding && <div className='calloutText'>
            Start with a blank project or get some guidance with a tutorial.
        </div>}
        <Row xs={1} md={2} className="g-4">
            {projects.map((project, idx) => (
                <Col key={idx}>
                    <ProjectCard path={project.path} title={project.title} description={project.description} color={project.color} onClick={() => router.push(project.path)} />
                </Col>
            ))}
        </Row>
        <style jsx>{`
            .pageTitle {
                margin-bottom: 1.25rem;
            }
            .calloutText {
                margin-bottom: 2.625rem;
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
        `}</style>
    </div >
}

PickProject.getLayout = useSimpleLogoutLayout;