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
import StarterGuide from "../components/StarterGuide";
import mixpanel from 'mixpanel-browser';

const ROTATION_WARNING = 'Are you sure you would like to rotate this API key? The current key will be invalidated and future calls made with it will be rejected.';

export default function ProjectSettings() {
    const projectSlug = useRouteParam('project', '/projects');
    const { keys, error: keysError, mutate: mutateKeys } = useApiKeys(projectSlug);
    const [showMainnetRotationModal, setShowMainnetRotationModal] = useState<boolean>(false);
    const [showTestnetRotationModal, setShowTestnetRotationModal] = useState<boolean>(false);

    // Tutorial projects do not have MAINNET keys.
    const hasMainnetKey = !!keys?.MAINNET;

    async function rotateKey(net: NetOption) {
        showMainnetRotationModal && setShowMainnetRotationModal(false);
        showTestnetRotationModal && setShowTestnetRotationModal(false);
        const subId = net === 'MAINNET' ? 2 : 1;
        try {
            // clear current key from the UI
            mutateKeys((cachedKeys: Record<NetOption, string>) => {
                delete cachedKeys[net];
                return cachedKeys;
            }, false);
            let newKey = await authenticatedPost('/projects/rotateKey', { project: projectSlug, environment: subId });
            mixpanel.track('DC Rotate API Key', {
                status: 'success',
                net: net,
            });
            mutateKeys((cachedKeys: Record<NetOption, string>) => {
                return {
                    ...cachedKeys,
                    ...newKey
                };
            }, false);
        } catch (e: any) {
            mixpanel.track('DC Rotate API Key', {
                status: 'failure',
                net: net,
                error: e.message,
            });
            // refetch just in case we cleared the old key from the UI but it was not actually rotated
            mutateKeys();
            // TODO log error
            throw new Error('Failed to rotate key');
        }
    }

    return (
        <div className='pageContainer'>
            <ProjectSelector />
            <div className="content">
                <div className='keysContainer'>
                    <h4>API Keys</h4>
                    {hasMainnetKey && <CenterModal show={showMainnetRotationModal} title='Rotate Mainnet Key?' content={ROTATION_WARNING} onConfirm={() => rotateKey('MAINNET')} confirmText="Rotate" onHide={() => setShowMainnetRotationModal(false)} />}
                    {hasMainnetKey && <KeyRow name='Mainnet' token={keys?.MAINNET} onRotateKey={() => setShowMainnetRotationModal(true)} />}
                    <CenterModal show={showTestnetRotationModal} title='Rotate Testnet Key?' content={ROTATION_WARNING} onConfirm={() => rotateKey('TESTNET')} confirmText="Rotate" onHide={() => setShowTestnetRotationModal(false)} />
                    <KeyRow name='Testnet' token={keys?.TESTNET} onRotateKey={() => setShowTestnetRotationModal(true)} />
                </div>
                <StarterGuide />
            </div>

            <style jsx>{`
                .pageContainer {
                display: flex;
                flex-direction: column;
                }
                .content {
                    display: flex;
                    flex-direction: column;
                    row-gap: 2rem;
                }
                .titleContainer {
                margin-bottom: 2.75rem;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                }
                .keysContainer {
                    display: flex;
                    flex-direction: column;
                    row-gap: 1rem;
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
        mixpanel.track('DC Copy API Key', {
            net: props.name
        });
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
                <Button variant='outline-primary' onClick={copyKey} disabled={!props.token}>
                    <FontAwesomeIcon icon={faCopy} />
                </Button>
                <div className='rotateButton'>
                    <Button variant='outline-danger' onClick={() => props.onRotateKey()} disabled={!props.token} ref={copyRef}>
                        Rotate
                    </Button>
                </div>
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
                .rotateButton > :global(.btn) {
                    width: 6rem;
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