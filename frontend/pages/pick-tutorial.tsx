import { useState } from 'react';
import { useSimpleLogoutLayout } from "../utils/layouts"
import { Row, Col, Alert } from 'react-bootstrap'
import { useRouter } from 'next/router';
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
    { tutorial: Tutorial.NftMarket, title: 'NFT Market', projectName: 'NFT Marketplace', path: '/tutorials/nfts/introduction', description: 'Start by minting an NFT using a pre-deployed contract, then build up to a fully-fledged NFT marketplace.' },
    { tutorial: Tutorial.Crossword, title: 'Crossword', description: 'Learn about access keys by building a crossword puzzle that pays out the daily winner.' },
];

export default function PickProject() {
    const router = useRouter();
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
        <div className='calloutText'>
            Choose from a variety of interactive tutorials. Each one ends with a production-ready project.
        </div>
        <Row xs={1} md={2} className="g-4">
            {projects.map((project, idx) => (
                <Col key={idx}>
                    <ProjectCard path={project.path} title={project.title} description={project.description} onClick={() => project.path && createProject(project.tutorial, project.projectName, project.path)} />
                </Col>
            ))}
        </Row>
        {creationError && <div className='errorContainer'><Alert variant='danger'>{creationError}</Alert></div>}
        <style jsx>{`
            .pageTitle {
                margin-bottom: 1.25rem;
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
        `}</style>
    </div >
}

PickProject.getLayout = useSimpleLogoutLayout;