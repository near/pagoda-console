import { authenticatedPost, useApiKeys, useProject } from "../utils/fetchers";
import { useRouteParam } from "../utils/hooks";
import { useDashboardLayout } from "../utils/layouts";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye, faCopy } from '@fortawesome/free-regular-svg-icons'
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons'
import { Button, Placeholder, Overlay } from 'react-bootstrap';
import { useState, useRef } from "react";
import { NetOption } from "../utils/interfaces";
import ProjectSelector from "../components/ProjectSelector";
import CenterModal from "../components/CenterModal";

const ROTATION_WARNING = 'Are you sure you would like to rotate this API key? The current key will be invalidated and future calls made with it will be rejected.';

export default function ProjectSettings() {
    const projectSlug = useRouteParam('project', '/projects');
    const { keys, error: keysError, mutate: mutateKeys } = useApiKeys(projectSlug);
    const [showMainnetRotationModal, setShowMainnetRotationModal] = useState<boolean>(false);
    const [showTestnetRotationModal, setShowTestnetRotationModal] = useState<boolean>(false);

    async function rotateKey(name: 'Mainnet' | 'Testnet') {
        showMainnetRotationModal && setShowMainnetRotationModal(false);
        showTestnetRotationModal && setShowTestnetRotationModal(false);
        const subId = name === 'Mainnet' ? 2 : 1;
        try {
            let newKey = await authenticatedPost('/projects/rotateKey', { project: projectSlug, environment: subId });
            mutateKeys((cachedKeys: Record<NetOption, string>) => {
                return {
                    ...cachedKeys,
                    ...newKey
                };
            }, false);
        } catch (e) {
            // TODO log error
            throw new Error('Failed to rotate key');
        }
    }

    return (
        <div className='pageContainer'>
            <ProjectSelector />
            <h2>Project Settings</h2>

            <h3>API Keys</h3>

            <div className='keysContainer'>
                <CenterModal show={showMainnetRotationModal} title='API Key Rotation' content={ROTATION_WARNING} onConfirm={() => rotateKey('Mainnet')} confirmText="I'm sure, rotate Mainnet key" onHide={() => setShowMainnetRotationModal(false)} />
                <KeyRow name='Mainnet' token={keys?.MAINNET} onRotateKey={() => setShowMainnetRotationModal(true)} />
                <CenterModal show={showTestnetRotationModal} title='API Key Rotation' content={ROTATION_WARNING} onConfirm={() => rotateKey('Testnet')} confirmText="I'm sure, rotate Testnet key" onHide={() => setShowTestnetRotationModal(false)} />
                <KeyRow name='Testnet' token={keys?.TESTNET} onRotateKey={() => setShowTestnetRotationModal(true)} />
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
            `}</style>
        </div>
    );
}

function KeyRow(props: { name: string, token?: string, onRotateKey: Function }) {
    let [keyObscured, setKeyObscured] = useState<boolean>(true);

    function getObscuredKey(key: string) {
        // const obscureChar = '*';
        // return key.substring(0, 4) + obscureChar.repeat(key.length - 4);
        return key.substring(0, 8) + `-●●●●-●●●●-●●●●-●●●●●●●●●●●●`
    }

    const copyRef = useRef(null);
    let [showCopiedAlert, setShowCopiedAlert] = useState<boolean>(false);
    const copiedTimer = useRef<NodeJS.Timeout>();
    function copyKey() {
        if (copiedTimer.current) {
            clearTimeout(copiedTimer.current);
        }
        props.token && navigator.clipboard.writeText(props.token);
        setShowCopiedAlert(true);
        copiedTimer.current = setTimeout(() => {
            setShowCopiedAlert(false);
        }, 2000);
    }

    return (
        <div className='keyRow'>
            <span className='keyTitle'>{props.name}</span>
            <span className='keyField'>{props.token ? (keyObscured ? getObscuredKey(props.token) : props.token) : <Placeholder animation='glow'><Placeholder xs={4} size='sm' style={{ borderRadius: '0.5em' }} /></Placeholder>}</span>
            <div className='buttonsContainer'>
                <Button variant='outline-primary' onClick={() => setKeyObscured(!keyObscured)} disabled={!props.token}>
                    <FontAwesomeIcon icon={keyObscured ? faEyeSlash : faEye} />
                </Button>
                <Button variant='outline-primary' onClick={() => props.onRotateKey()}>
                    <FontAwesomeIcon icon={faRedoAlt} />
                </Button>
                <Button variant='outline-primary' onClick={copyKey} disabled={!props.token} ref={copyRef}>
                    <FontAwesomeIcon icon={faCopy} />
                </Button>
                <Overlay target={copyRef} show={showCopiedAlert} popperConfig={{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }} placement='right'>
                    {({ placement, arrowProps, show: _show, popper, ...props }) => (
                        <div
                            {...props}
                            style={{
                                backgroundColor: 'gray',
                                padding: '0.25em 0.5em',
                                color: 'white',
                                borderRadius: 3,
                                ...props.style,
                            }}
                        >
                            Copied!
                        </div>
                    )}
                </Overlay>
            </div>
            <style jsx>{`
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