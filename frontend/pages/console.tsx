import firebase from 'firebase';
import { Alert, Button, Modal, Placeholder, Spinner, DropdownButton, Dropdown, Badge, Overlay, ModalDialogProps } from 'react-bootstrap';
import useSWR, { useSWRConfig } from 'swr'
import React, { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import dynamic from "next/dynamic";
import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
    ssr: false,
});

// assets
import { faEyeSlash, faEye, faCopy } from '@fortawesome/free-solid-svg-icons'
import NearIcon from '../public/brand/near_icon.svg'
import CornerGradient from '../public/corner_grad.svg'
import VerticalGradient from '../public/corner_grad_vert.svg'
import NavBar from '../public/navbar.svg'

// TODO convert to environment variable
const BASE_URL = 'https://0821-71-207-128-178.ngrok.io';
const MAIN_NET_RPC = 'https://rpc.mainnet.near.org'
const TEST_NET_RPC = 'https://rpc.testnet.near.org'

interface Dapp {
    address: string,
    net: 'MAIN' | 'TEST'
}


const fetcher = async (url: string) => {
    const headers = new Headers({
        'Authorization': `Bearer ${await firebase.auth().currentUser?.getIdToken()}`
    });
    return fetch(url, {
        headers
    }).then((res) => res.json())
}

interface Account {
    id: number,
    uid: string,
    email?: string,
    photoUrl?: string,
    name?: string,
    apiKey: string,
    apiKeyTest: string,
}

const Console: NextPage = () => {
    const router = useRouter();
    const [user, setUser] = useState<firebase.User>();
    const [token, setToken] = useState<string>();
    const { data: account, error }: { data?: Account, error?: any } = useSWR(user ? [`${BASE_URL}/user/getAccountDetails`, user.uid] : null, fetcher);
    // TODO user error

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if (user) {
                setUser(user);
                (async () => {
                    let idToken: string = await user.getIdToken();
                    console.log(idToken);
                    setToken(idToken);
                })();
            } else {
                // user is signed out, redirect back to login
                router.push('/');
            }
        })
    });

    // account details modal
    let [showAccountDetailsModal, setShowAccountDetailsModal] = useState<boolean>(false);
    const handleAccountDetailsModalClose = () => setShowAccountDetailsModal(false);
    // const handleAccountDetailsModalShow = () => setShowAccountDetailsModal(true);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <Head>
                <title>NEAR Dev Console</title>
            </Head>
            <SideBar />
            <div style={{ flexGrow: 1 }}>
                {/* <div style={{position: 'absolute', width: '10em', height: '10em', overflow: 'hidden'}}>
                <CornerGradient style={{width: '100%', height: '100%'}}/>
                </div> */}
                {/* <div style={{position: 'absolute', width: '33.3vh', height: '100vh', overflow: 'hidden', zIndex: -1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}> */}
                <div style={{ position: 'absolute', width: '33.3vh', height: '100vh', overflow: 'hidden', zIndex: -1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}> {/* floating towards bottom */}
                    {/* <div style={{height: '30em', width: '10em', margin: 'auto 0'}}> */}
                    <div style={{ height: '30em', width: '10em' }}> {/* floating towards bottom */}
                        {/* <VerticalGradient style={{ width: '100%', height: '100%' }} /> */}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '30px', flexGrow: 1, rowGap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <ThemeToggle />
                        <Button variant='outline-neutral' style={{ marginLeft: '1em' }} onClick={() => { setShowAccountDetailsModal(true) }}>Account</Button>
                        <Button variant='neutral' style={{ marginLeft: '1em' }} onClick={() => { firebase.auth().signOut() }}>Sign Out</Button>
                    </div>
                    <h1>Welcome {account ? account.name : <Placeholder animation='glow'><Placeholder xs={4} size='sm' style={{ borderRadius: '0.5em' }} /></Placeholder>}</h1>
                    {account && user
                        ? <DappList user={user} />
                        : <div style={{ display: 'flex', flexGrow: 1 }}>
                            <Spinner style={{ margin: 'auto' }} animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    }
                </div>
            </div>
            {account && <AccountDetailsModal show={showAccountDetailsModal} close={handleAccountDetailsModalClose} account={account} />}
        </div>
    );
}

function SideBar() {
    return <div style={{ display: 'flex', flexDirection: 'column', width: '12em', backgroundColor: '#fff', height: '100%' }}>
        <div style={{ position: 'absolute', width: '12em', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ height: '30em', width: '10em', margin: 'auto 0', transform: 'scaleX(-1)'}}>
                <VerticalGradient style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
        {/* <div style={{ position: 'absolute', width: '12em', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '36em', width: '12em', margin: 'auto 0'}}>
                <VerticalGradient style={{ width: '100%', height: '100%' }} />
            </div>
        </div> */}
        <div style={{ width: '8em', padding: '2em' }}>
            <NearIcon />
        </div>
            <NavBar style={{ padding: '1em', width: '100%', flexGrow: 1}}/>
    </div>
}

function DappList(props: { user: firebase.User }) {
    const { data, error, isValidating }: { data?: Dapp[], error?: any, isValidating: boolean } = useSWR([`${BASE_URL}/dapp/getForUser`, props.user.uid], fetcher)

    let [showAddModal, setShowAddModal] = useState<boolean>(false);
    const handleAddModalClose = () => setShowAddModal(false);
    const handleAddModalShow = () => setShowAddModal(true);

    if (!data && !error) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <Alert variant='danger'>Something went wrong while fetching dapp list</Alert>;
    }

    // TODO check why data can be undefined
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 12em 12em', width: '100%' }}>
                <span />
                <p style={{ textAlign: 'right', fontWeight: 'bold' }}>Account Balance</p>
                <p style={{ textAlign: 'right', fontWeight: 'bold' }}>Storage Used</p>
                {data!.map((dapp) => <DappItem key={dapp.address} dapp={dapp} />)}
                <Button variant='neutral' style={{ width: '100px' }} onClick={handleAddModalShow}>Add</Button>

                <AddContractModal show={showAddModal} close={handleAddModalClose} />
            </div>
            {isValidating && <Spinner style={{ position: 'absolute', bottom: '0.5em', right: '0.5em' }} animation="border" />}
        </div>
    );
}

interface DappItemProps {
    dapp: Dapp
};
function DappItem(props: DappItemProps) {
    const { data, error } = useSWR([props.dapp.address, props.dapp.net], async (address: string) => {
        const res = await fetch(props.dapp.net === 'MAIN' ? MAIN_NET_RPC : TEST_NET_RPC, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": "dontcare",
                "method": "query",
                "params": {
                    "request_type": "view_account",
                    "finality": "final",
                    "account_id": address
                }
            })
        }).then((res) => res.json());
        if (res.error) {
            // TODO decide whether to retry error
            throw new Error(res.error.name);
        }
        return res;
    }, {
        // TODO decide whether to retry error
        shouldRetryOnError: false
    });

    // TODO handle error
    return <React.Fragment>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <a className='link' href={`https://explorer${props.dapp.net === 'TEST' ? '.testnet' : ''}.near.org/accounts/${props.dapp.address}`} target="_blank" rel="noopener noreferrer">{props.dapp.address}</a>
            {props.dapp.net === 'TEST' && <p><Badge style={{ marginLeft: '1em' }} bg="secondary">Test</Badge></p>}
        </div>
        {data ? <p style={{ textAlign: 'right' }}>{(data.result.amount / (10 ** 24)).toFixed(5)} Ⓝ</p> : (!error ? <BorderSpinner /> : <p style={{ textAlign: 'right' }}>N/A</p>)}
        {data ? <p style={{ textAlign: 'right' }}>{data.result.storage_usage} B</p> : (!error ? <BorderSpinner /> : <p style={{ textAlign: 'right' }}>N/A</p>)}
        <style jsx>{`
                a {
                    text-decoration: underline
                }
            `}
        </style>
    </React.Fragment>
}

function AddContractModal(props: { show: boolean, close: () => void }) {
    let [contractAccount, setContractAccount] = useState<string>('');
    function clearAndClose() {
        props.close();
        setContractAccount('');
        setNet('Mainnet');
    }
    const { mutate } = useSWRConfig();

    let [addInProgress, setAddInProgress] = useState<boolean>(false);
    async function addContract() {
        setAddInProgress(true);
        try {
            const res = await fetch(`${BASE_URL}/dapp/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await firebase.auth().currentUser?.getIdToken()}` // TODO convert to hook
                },
                body: JSON.stringify({
                    address: contractAccount,
                    net: net === 'Mainnet' ? 'MAIN' : 'TEST'
                })
            });
            setAddInProgress(false);
            if (!res.ok) {
                throw new Error(`Failed to add contract for tracking: ${res.status} | ${res.statusText}`);
            }

            // TODO find way to keep this in sync with the SWR call above, probably through a custom hook
            mutate([`${BASE_URL}/dapp/getForUser`, firebase.auth().currentUser?.uid]);
            clearAndClose();
        } catch (e) {
            // TODO
            console.error(e);
        }
    }

    type NetOptions = 'Mainnet' | 'Testnet';
    let [net, setNet] = useState<NetOptions>('Mainnet');


    // autofocus address field on modal open
    const addressInputRef = useRef<HTMLInputElement>(null);

    return (
        <Modal show={props.show} onShow={() => addressInputRef.current?.focus()} onHide={clearAndClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add a Contract</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ display: 'flex', flexDirection: 'column', rowGap: '1em' }}>
                {!addInProgress
                    ? <React.Fragment>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <p style={{ margin: 'auto' }}>Contract Account Name</p>
                            </div>
                            <DropdownButton
                                variant="secondary"
                                menuVariant="dark"
                                title={net}
                                onSelect={(eventKey) => {
                                    setNet(eventKey as NetOptions);
                                }}
                            >
                                <Dropdown.Item eventKey="Mainnet" active={net === 'Mainnet'}>
                                    Mainnet
                                </Dropdown.Item>
                                <Dropdown.Item eventKey="Testnet" active={net === 'Testnet'}>Testnet</Dropdown.Item>
                            </DropdownButton>
                        </div>
                        <input ref={addressInputRef} type="text" name="contract" value={contractAccount} onChange={(event) => { setContractAccount(event.target.value) }} /></React.Fragment>
                    : <p>Adding {contractAccount}...</p>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={clearAndClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={addContract}>
                    Add
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function BorderSpinner() {
    return <Spinner style={{ margin: 'auto' }} animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
    </Spinner>
}

function AccountDetailsModal(props: { account: Account, show: boolean, close: () => void }) {

    let [keyObscured, setKeyObscured] = useState<boolean>(true);
    function obscureKey() {
        setKeyObscured(true);
    }

    let [testKeyObscured, setTestKeyObscured] = useState<boolean>(true);
    function obscureTestKey() {
        setTestKeyObscured(true);
    }

    let [showCopiedMain, setShowCopiedMain] = useState<boolean>(false);
    const mainKeyTitleTarget = useRef<HTMLSpanElement>(null);
    let copiedMainTimeout: NodeJS.Timeout | null;
    function copyMain() {
        if (copiedMainTimeout) {
            // TODO determine why clearing is not preventing the overlay from disappearing
            clearTimeout(copiedMainTimeout);
        }
        navigator.clipboard.writeText(props.account.apiKey);
        setShowCopiedMain(true);
        copiedMainTimeout = setTimeout(() => {
            setShowCopiedMain(false);
            copiedMainTimeout = null;
        }, 1500);
    }

    let [showCopiedTest, setShowCopiedTest] = useState<boolean>(false);
    const testKeyTitleTarget = useRef<HTMLSpanElement>(null);
    let copiedTestTimeout: NodeJS.Timeout | null;
    function copyTest() {
        if (copiedTestTimeout) {
            clearTimeout(copiedTestTimeout);
            console.log('clearing');
        }
        navigator.clipboard.writeText(props.account.apiKeyTest);
        setShowCopiedTest(true);
        copiedTestTimeout = setTimeout(() => {
            console.log(`timing out`)
            setShowCopiedTest(false);
            copiedTestTimeout = null;
        }, 1500);
    }

    const modalBodyRef = useRef<any>(null);


    function getObscuredKey(key: string) {
        const obscureChar = '*';
        return key.substring(0, 4) + obscureChar.repeat(key.length - 4);
    }
    return <Modal show={props.show} onHide={() => {
        obscureKey();
        obscureTestKey();
        props.close();
    }}>
        <Modal.Header closeButton>
            <Modal.Title>Account Details</Modal.Title>
        </Modal.Header>
        <Modal.Body ref={modalBodyRef} style={{ display: 'flex', flexDirection: 'column', rowGap: '2em', paddingBottom: '2.5em' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div><span style={{ fontWeight: 'bold' }} ref={mainKeyTitleTarget}>Mainnet API Key</span></div>
                <Overlay target={mainKeyTitleTarget} container={modalBodyRef} show={showCopiedMain} placement='right'>
                    {({ placement, arrowProps, show: _show, popper, ...props }) => (
                        <div
                            {...props}
                            style={{
                                backgroundColor: 'gray',
                                padding: '0.25em 0.5em',
                                marginLeft: '0.5em',
                                color: 'white',
                                borderRadius: 3,
                                ...props.style,
                            }}
                        >
                            Copied!
                        </div>
                    )}
                </Overlay>
                <div style={{ display: 'flex', flexDirection: 'row', columnGap: '1em', justifyContent: 'space-between' }}>
                    <p style={{ margin: 'auto 0' }}>{keyObscured ? getObscuredKey(props.account.apiKey) : props.account.apiKey}</p>
                    <div style={{ display: 'flex', flexDirection: 'row', columnGap: '1em' }}>
                        <Button style={{ width: '3em' }} variant='outline-dark' onClick={() => setKeyObscured(!keyObscured)}><FontAwesomeIcon icon={keyObscured ? faEyeSlash : faEye} /></Button>
                        <Button style={{ width: '3em' }} variant='outline-dark' onClick={copyMain}><FontAwesomeIcon icon={faCopy} /></Button>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div><span style={{ fontWeight: 'bold' }} ref={testKeyTitleTarget}>Testnet API Key</span></div>
                <Overlay target={testKeyTitleTarget} container={modalBodyRef} show={showCopiedTest} placement='right'>
                    {({ placement, arrowProps, show: _show, popper, ...props }) => (
                        <div
                            {...props}
                            style={{
                                backgroundColor: 'gray',
                                padding: '0.25em 0.5em',
                                marginLeft: '0.5em',
                                color: 'white',
                                borderRadius: 3,
                                ...props.style,
                            }}
                        >
                            Copied!
                        </div>
                    )}
                </Overlay>
                <div style={{ display: 'flex', flexDirection: 'row', columnGap: '1em', justifyContent: 'space-between' }}>
                    <p style={{ margin: 'auto 0' }}>{testKeyObscured ? getObscuredKey(props.account.apiKeyTest) : props.account.apiKeyTest}</p>
                    <div style={{ display: 'flex', flexDirection: 'row', columnGap: '1em' }}>
                        <Button style={{ width: '3em' }} variant='outline-dark' onClick={() => setTestKeyObscured(!testKeyObscured)}><FontAwesomeIcon icon={testKeyObscured ? faEyeSlash : faEye} /></Button>
                        <Button style={{ width: '3em' }} variant='outline-dark' onClick={copyTest}><FontAwesomeIcon icon={faCopy} /></Button>
                    </div>
                </div>
            </div>
        </Modal.Body>
    </Modal>
}

export default Console;