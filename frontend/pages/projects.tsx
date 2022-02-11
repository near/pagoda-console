import { useSimpleLogoutLayout } from "../utils/layouts";
import { Alert, Button } from 'react-bootstrap';
import { useRouter } from "next/router";
import { authenticatedPost, useProjects } from "../utils/fetchers";
import { Project } from '../utils/interfaces';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { useEffect, useState } from "react";
import BorderSpinner from "../components/BorderSpinner";
import CenterModal from "../components/CenterModal";
import mixpanel from 'mixpanel-browser';
import { faExclamationCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import TutorialBadge from "../components/TutorialBadge";

export default function Projects() {
    const router = useRouter();
    const { projects, error, isValidating, mutate: refetchProjects } = useProjects();
    let [isEditing, setIsEditing] = useState<boolean>(false);
    const [showRedirectAlert, setShowRedirectAlert] = useState<boolean>(false);

    useEffect(() => {
        if (window.sessionStorage.getItem('redirected') === 'true') {
            setShowRedirectAlert(true);
            // Reset global state.
            window.sessionStorage.removeItem('redirected');
        }
    }, []);

    useEffect(() => {
        router.prefetch('/pick-project');
        // Prefetch only needs to happen once. Disabling rule.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let body;
    if (error) {
        // TODO
        body = <div>An error occurred</div>;
    } else if (!projects) {
        // TODO
        return <BorderSpinner />;
    } else if (!projects.length && !isValidating) {
        // TODO
        router.push('/pick-project?onboarding=true');
        return <></>;
    } else {
        body = projects!.map((proj, index, arr) => <ProjectRow key={proj.id} project={proj} showDelete={isEditing} isTop={index === 0} onDelete={() => refetchProjects()} />);
    }
    return <div className='projectsContainer'>
        <div className='headerContainer'>
            <h1>Projects</h1>
            <div className="buttonContainer">
                <Button onClick={() => router.push('/pick-project')}>Create</Button>
                <Button onClick={() => setIsEditing(!isEditing)}>{!isEditing ? 'Edit' : 'Done'}</Button>
            </div>
        </div>
        {showRedirectAlert && <div className="alertContainer"><RedirectAlert onClick={() => setShowRedirectAlert(false)}></RedirectAlert></div>}
        <div className='listContainer'>
            {body}
        </div>
        <style jsx>{`
            .projectsContainer {
                width: 44rem;
            }
            .headerContainer {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
            .buttonContainer :global(button) {
                margin-left: 0.688rem;
            }
            .alertContainer {
                margin-top: 1.25rem;
            }
            .listContainer {
                margin-top: 1.25rem;
                /*TODO review styling for very long list */
                overflow-y: auto;
                max-height: 40rem;
            }
        `}</style>
    </div >
}

function RedirectAlert(props: { onClick: () => void }) {
    return <Alert variant='danger'>
        <p className='alertContent'>
            <FontAwesomeIcon icon={faExclamationCircle}></FontAwesomeIcon> <b>Error: </b>{"That project does not exist or you don't have permission to access it."} <span className="dismissIcon" onClick={() => props.onClick()}><FontAwesomeIcon icon={faTimes}></FontAwesomeIcon></span>
        </p>
        <style jsx>{`
            .alertContent {
                font-size: 0.75rem;
                line-height: 1rem;
                margin: 0px;
            }
            .dismissIcon {
                cursor: pointer;
                position: absolute;
                top: 0;
                right: 0;
                z-index: 2;
                padding: 1rem;
            }
        `}</style>
    </Alert>;
}

function ProjectRow(props: { project: Project, showDelete: boolean, isTop: boolean, onDelete: () => void }) {
    let [showModal, setShowModal] = useState<boolean>(false);

    async function deleteProject() {
        try {
            await authenticatedPost('/projects/delete', { slug: props.project.slug });
            mixpanel.track('DC Remove Project', {
                status: 'success',
                name: props.project.name
            });
            props.onDelete();
            setShowModal(false);
        } catch (e: any) {
            mixpanel.track('DC Remove Project', {
                status: 'failure',
                name: props.project.name,
                error: e.message,
            });
            // TODO
            console.error('Failed to delete project');
        }
    }

    const warning = 'Removing this project may have unintended consequences, make sure the API keys for this project are no longer in use before removing it.';

    return (
        <div className='projectRowContainer'>
            <CenterModal show={showModal} title={`Remove ${props.project.name}`} content={warning} onConfirm={deleteProject} confirmText='Remove' onHide={() => setShowModal(false)} />
            <Link href={`/analytics?project=${props.project.slug}`}>
                <a className='projectLink'><div className='linkDiv'>{props.project.name} {props.project.tutorial && <TutorialBadge />}</div></a>
            </Link>
            {props.showDelete && <Button onClick={() => setShowModal(true)}><FontAwesomeIcon icon={faTrashAlt} /></Button>}
            <style jsx>{`
                .projectRowContainer {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    height: 3.125rem;
                    width: 100%;
                    border-top: ${!props.isTop ? '1px solid #DEE2E6' : '0'};
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
        </div>
    )
}

Projects.getLayout = useSimpleLogoutLayout;