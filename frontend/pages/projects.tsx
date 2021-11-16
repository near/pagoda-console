import { useSimpleLayout } from "../utils/layouts";
import { Button, Badge } from 'react-bootstrap';
import { useRouter } from "next/router";

const testProjects = [
    {
        id: 1,
        name: 'My Cool Project',
        net: 'MAINNET' as NetOption,
    },
    {
        id: 2,
        name: 'My Cool Project',
        net: 'MAINNET' as NetOption,
    },
    {
        id: 3,
        name: 'My Cool Project',
        net: 'MAINNET' as NetOption,
    },
    {
        id: 4,
        name: 'My Cool Project',
        net: 'MAINNET' as NetOption,
    },
]

export default function Projects() {
    const router = useRouter();
    return <div className='projectsContainer'>
        <div className='headerContainer'>
            <h1>Projects</h1>
            <Button>Edit</Button>
        </div>
        <div className='listContainer'>
            {testProjects.map((proj, index, arr) => <ProjectRow key={proj.id} project={proj} roundTop={index === 0} roundBottom={index === arr.length - 1} />)}
        </div>
        <div className='footerContainer'>
            <Button onClick={() => router.push('/new-project')}>Create a Project</Button>
        </div>
        <style jsx>{`
            .projectsContainer {
                width: 34.125rem;
            }
            .headerContainer {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
            .listContainer {
                margin-top: 1.25rem;
                /*TODO review styling for very long list */
                overflow-y: auto;
                max-height: 40rem;
            }
            .footerContainer {
                margin-top: 1.25rem;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
            }
        `}</style>
    </div>
}

type NetOption = 'MAINNET' | 'TESTNET';

interface Project {
    id: number,
    name: string,
    net: NetOption,
}

function ProjectRow(props: { project: Project, roundTop: boolean, roundBottom: boolean }) {
    const topRadius = props.roundTop ? '4' : '0';
    const bottomRadius = props.roundBottom ? '4' : '0';
    return (
        <div className='projectRowContainer'>
            <span>{props.project.name}</span>
            <Badge pill bg='secondary'>{props.project.net}</Badge>
            <style jsx>{`
                .projectRowContainer {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    height: 3.125rem;
                    width: 100%;
                    border-right: 1px solid #DEE2E6;
                    border-left: 1px solid #DEE2E6;
                    border-bottom: 1px solid #DEE2E6;
                    padding: 0 1.5em;
                    align-items: center;
                }
            `}</style>
            <style jsx>{`
                .projectRowContainer {
                    border-radius: ${topRadius}px ${topRadius}px ${bottomRadius}px ${bottomRadius}px;
                    border-top: ${props.roundTop ? '1px solid #DEE2E6' : '0px'};
                }
            `}</style>
        </div>
    )
}

Projects.getLayout = useSimpleLayout;