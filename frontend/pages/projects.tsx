import { useSimpleLayout } from "../utils/layouts";
import { Button } from 'react-bootstrap';
import { useRouter } from "next/router";
import { useProjects } from "../utils/fetchers";
import { Project } from '../utils/interfaces';
import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { useState } from "react";
import BorderSpinner from "../components/BorderSpinner";

// const testProjects: Project[] = [
// {
//     id: 1,
//     name: 'My Cool Project',
//     net: 'MAINNET' as NetOption,
// },
// {
//     id: 2,
//     name: 'My Cool Project',
//     net: 'MAINNET' as NetOption,
// },
// {
//     id: 3,
//     name: 'My Cool Project',
//     net: 'MAINNET' as NetOption,
// },
// {
//     id: 4,
//     name: 'My Cool Project',
//     net: 'MAINNET' as NetOption,
// },
// ]

export default function Projects() {
    const router = useRouter();
    const { projects, error, isValidating } = useProjects();
    let [isEditing, setIsEditing] = useState<boolean>(false);

    let body;
    if (error) {
        // TODO
        body = <div>An error occurred</div>;
    } else if (!projects) {
        // TODO
        return <BorderSpinner />;
    } else if (!projects.length && !isValidating) {
        // TODO
        router.push('/new-project');
        return <></>;
    } else {
        body = projects!.map((proj, index, arr) => <ProjectRow key={proj.id} project={proj} roundTop={index === 0} roundBottom={index === arr.length - 1} showDelete={isEditing} />);
    }
    return <div className='projectsContainer'>
        <div className='headerContainer'>
            <h1>Projects</h1>
            <Button onClick={() => setIsEditing(!isEditing)}>{!isEditing ? 'Edit' : 'Done'}</Button>
        </div>
        <div className='listContainer'>
            {body}
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

function ProjectRow(props: { project: Project, roundTop: boolean, roundBottom: boolean, showDelete: boolean }) {
    const topRadius = props.roundTop ? '4' : '0';
    const bottomRadius = props.roundBottom ? '4' : '0';
    return (
        <div className='projectRowContainer'>
            <Link href={`/project/${props.project.slug}/contracts`}>
                <a className='projectLink'><div className='linkDiv'>{props.project.name}</div></a>
            </Link>
            {props.showDelete && <Button><FontAwesomeIcon icon={faTrashAlt} /></Button>}
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
                    align-items: center;
                }
                .projectLink:hover {
                    color: var(--color-accent-purple)
                }
                .projectLink {
                    padding: 0 1.5em;
                    text-decoration: none;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .projectRowContainer :global(.btn) {
                    margin-right: 0.5rem;
                    padding-right: 1.25rem;
                    padding-left: 1.25rem;
                    background-color: transparent;
                    color: var(--color-primary);
                    border: none;
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