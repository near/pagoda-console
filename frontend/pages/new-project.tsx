import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useSimpleLayout } from "../utils/layouts"
import { Form, Button } from 'react-bootstrap'
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/router';
import { Project } from '../utils/interfaces';
import { authenticatedPost } from '../utils/fetchers';
import { useRouteParam } from '../utils/hooks';
import mixpanel from 'mixpanel-browser';
import { logOut } from '../utils/auth';
import BorderSpinner from '../components/BorderSpinner';

export default function NewProject() {
    let [projectName, setProjectName] = useState<string>('');
    let [formEnabled, setFormEnabled] = useState<boolean>(true);
    const router = useRouter();

    let [lastVisitedPath, setLastVisitedPath] = useState<string>('');
    useEffect(() => setLastVisitedPath(window.sessionStorage.getItem("lastVisitedPath") || ''), []);

    const isOnboarding = useRouteParam('onboarding');

    let [creationError, setCreationError] = useState<string>();
    let [validationError, setValidationError] = useState<string>();
    const [createInProgress, setCreateInProgress] = useState<boolean>(false);

    function canCreate(): boolean {
        return formEnabled && !!projectName.trim() && !validationError;
    }

    async function createProject(e: FormEvent): Promise<void> {
        if (!canCreate()) {
            return;
        }
        e.preventDefault();
        setFormEnabled(false);
        try {
            setCreateInProgress(true);
            const project: Project = await authenticatedPost('/projects/create', { name: projectName }, { forceRefresh: true });
            mixpanel.track('DC Create New Project', {
                status: 'success',
                name: projectName,
            });
            router.push(`/project-settings?project=${project.slug}&onboarding=true`);
        } catch (e: any) {
            mixpanel.track('DC Create New Project', {
                status: 'failure',
                name: projectName,
                error: e.message,
            });
            setFormEnabled(true);
            setCreationError('Something went wrong');
        } finally {
            setCreateInProgress(false);
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setCreationError('');
        if (e?.target && e.target.value.length > 50) {
            setValidationError('Project names cannot be longer than 50 characters');
        } else if (validationError) {
            setValidationError('');
        }

        setProjectName(e.target.value)
    }

    return <div className='newProjectContainer'>
        <h1>New Project</h1>
        {isOnboarding && <div className='calloutText'>
            <span className='boldText'>One last thing! </span>
            Before we let you loose on the Developer Console, you’ll need to create a project. Projects contain API keys and any smart contracts you wish to track.
        </div>}
        <Form className='newProjectForm' onSubmit={createProject}>
            <Form.Group className='formField' controlId="projectNameInput">
                <Form.Label>Project Name</Form.Label>
                <Form.Control placeholder="Cool New Project" value={projectName} onChange={handleChange} isInvalid={!!(validationError || creationError)} />
                <Form.Control.Feedback type='invalid'>{validationError || creationError}</Form.Control.Feedback>
            </Form.Group>
            <div className="submitRow">
                <div className='submitContainer'>
                    {createInProgress && <BorderSpinner />}
                    {!isOnboarding && lastVisitedPath && <Button onClick={() => router.push(lastVisitedPath)}>Back</Button>}
                    <Button variant='primary' type='submit' disabled={!canCreate()}>Create a Project</Button>
                </div>
            </div>
        </Form>
        {isOnboarding && <div className='signOut' onClick={logOut}>Log Out</div>}
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
                    cursor: pointer;
                    text-decoration: none;
                    position: absolute;
                    left: 3rem;
                    bottom: 3rem;
                }
            .signOut:hover {
                color: var(--color-primary)
            }
        `}</style>
    </div >
}

NewProject.getLayout = useSimpleLayout;