import { FormEvent, useState } from 'react';
import { useSimpleLayout } from "../utils/layouts"
import { Form, Button, Alert } from 'react-bootstrap'
import { useIdentity } from '../utils/hooks';
import { getIdToken } from 'firebase/auth';

type NetOption = 'MAINNET' | 'TESTNET';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!; // TODO extract to config hook

export default function NewProject() {
    let [projectName, setProjectName] = useState<string>('');
    let [net, setNet] = useState<NetOption>('MAINNET');
    let [formEnabled, setFormEnabled] = useState<boolean>(true);

    // temp
    let [success, setSuccess] = useState<boolean | null>(null);

    const identity = useIdentity();
    async function createProject(e: FormEvent): Promise<void> {
        e.preventDefault();
        console.log(projectName, net);
        setFormEnabled(false);
        try {
            const res = await fetch(`${BASE_URL}/projects/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getIdToken(identity!)}`
                },
                body: JSON.stringify({
                    name: projectName,
                    net,
                })
            });
            // TODO handle success
            setSuccess(true);
        } catch (e) {
            setFormEnabled(true);
            setSuccess(false);
            // TODO handle error
        }
    }

    return <div className='newProjectContainer'>
        <h1>New Project</h1>
        <Form className='newProjectForm' onSubmit={createProject}>
            <Form.Group className='formField' controlId="projectNameInput">
                <Form.Label>Project Name</Form.Label>
                <Form.Control placeholder="Cool New Project" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </Form.Group>
            <Form.Group className='formField' controlId="networkSelect">
                <Form.Label>Network</Form.Label>
                <Form.Select aria-label="Network Select" value={net} onChange={(e) => setNet(e.target.value as NetOption)}>
                    <option value="MAINNET">Mainnet</option>
                    <option value="TESTNET">Testnet</option>
                </Form.Select>
            </Form.Group>
            <div className='buttonContainer'>
                <Button variant='primary' type='submit' disabled={!formEnabled}>Create a Project</Button>
            </div>
            {(success !== null) && <Alert variant={success ? 'success' : 'danger'}>{success ? 'Success' : 'Something went wrong'}</Alert>}
        </Form>
        <style jsx>{`
            .newProjectContainer {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 22.25rem;
                margin: 0 auto;
            }
            .newProjectContainer :global(.newProjectForm) {
                width: 100%;
            }
            .newProjectContainer :global(.formField) {
                margin-bottom: 1rem;
            }
            .newProjectContainer :global(.alert) {
                /* temp */
                margin-top: 1em;
            }
            h1 {
                margin-bottom: 1.25rem;
                width: 100%
            }
            .buttonContainer {
                width: 100%;
                display: flex;
                justify-content: flex-end;
            }
        `}</style>
    </div >
}

NewProject.getLayout = useSimpleLayout;