import { useProject } from "../utils/fetchers";
import { useRouteParam } from "../utils/hooks";
import { useDashboardLayout } from "../utils/layouts";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye, faCopy } from '@fortawesome/free-regular-svg-icons'
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'react-bootstrap';

export default function ProjectSettings() {
    const projectSlug = useRouteParam('project', '/projects');
    const { project, error } = useProject(projectSlug);

    return (
        <div className='pageContainer'>
            <div className='titleContainer'>
                <h1>{project?.name || 'Loading...'}</h1>
            </div>
            <h2>Project Settings</h2>

            <h3>API Keys</h3>

            <div className='keysContainer'>
                <div className='keyRow'>
                    <span className='keyTitle'>Mainnet</span>
                    <span className='keyField'>{'<api key>'}</span>
                    <div className='buttonsContainer'>
                        <Button variant='outline-primary'>
                            <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button variant='outline-primary'>
                            <FontAwesomeIcon icon={faRedoAlt} />
                        </Button>
                        <Button variant='outline-primary'>
                            <FontAwesomeIcon icon={faCopy} />
                        </Button>
                    </div>
                </div>
                <div className='keyRow'>
                    <span className='keyTitle'>Testnet</span>
                    <span className='keyField'>3a2be6fe-●●●●-●●●●-●●●●-●●●●●●●●●●●●</span>
                    <div className='buttonsContainer'>
                        <Button variant='outline-primary'>
                            <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button variant='outline-primary'>
                            <FontAwesomeIcon icon={faRedoAlt} />
                        </Button>
                        <Button variant='outline-primary'>
                            <FontAwesomeIcon icon={faCopy} />
                        </Button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .pageContainer {
                display: flex;
                flex-direction: column;
                }
                .titleContainer {
                margin-bottom: 2.75rem;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                }
                h3 {
                    margin-top: 2rem;
                }
                .keysContainer {
                    display: flex;
                    flex-direction: column;
                    row-gap: 1rem;
                    margin-top: 1.5rem;
                }
                .keyRow {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                }
                .keyField {
                    flex-grow: 1;
                }
                .buttonsContainer {
                    display: flex;
                    flex-direction: row;
                    column-gap: 0.5rem;
                }
                .buttonsContainer > :global(.btn) {
                    width: 3rem;
                }
                .keyTitle {
                    width: 6rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}

ProjectSettings.getLayout = useDashboardLayout;