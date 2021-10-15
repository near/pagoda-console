import firebase from 'firebase';
import { Alert, Button, Modal, Placeholder, Spinner } from 'react-bootstrap';
import useSWR, { useSWRConfig } from 'swr'
import Image from 'next/image'
import nearIcon from '../public/brand/near_icon.png'
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

// TODO convert to environment variable
// const BASE_URL = 'http://localhost:3001';
const BASE_URL = 'https://ba5c-71-207-128-178.ngrok.io';

interface Dapp {
    address: string
}

function useTokenSWR(url: string) {

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
    name?: string
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

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <SideBar />
            <div style={{ display: 'flex', flexDirection: 'column', padding: '30px', flexGrow: 1, rowGap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant='dark' onClick={() => { firebase.auth().signOut() }}>Sign Out</Button>
                </div>
                <h1>Welcome {account ? account.name : <Placeholder animation='glow'><Placeholder xs={4} size='sm' style={{ borderRadius: '0.5em' }} /></Placeholder>}</h1>
                {user
                    ? <DappList user={user} />
                    : <div style={{ display: 'flex', flexGrow: 1 }}>
                        <Spinner style={{ margin: 'auto' }} animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                }
            </div>
        </div>
    );
}

function SideBar() {
    return <div style={{ display: 'flex', flexDirection: 'column', width: '12em', backgroundColor: '#f2f2f2', height: '100%' }}>
        <div style={{ width: '8em' }}>
            <Image
                src={nearIcon}
                alt="Near Inc Icon"
            />
        </div>
    </div>
}

function DappList(props: { user: firebase.User }) {
    const { data, error, isValidating }: { data?: Dapp[], error?: any, isValidating: boolean } = useSWR([`${BASE_URL}/dapp/getForUser`, props.user.uid], fetcher)

    let [showAddModal, setShowAddModal] = useState<boolean>(false);
    const handleClose = () => setShowAddModal(false);
    const handleShow = () => setShowAddModal(true);

    if (!data && !error) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <Alert variant='danger'>Something went wrong while fetching dapp list</Alert>;
    }

    // return (
    //     <div style={{ display: 'flex', flexDirection: 'column', rowGap: '12px' }}>
    //         <h2>Contracts</h2>
    //         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
    //             <p style={{ width: '10em', textAlign: 'right', fontWeight: 'bold' }}>Account Balance</p>
    //             <p style={{ width: '10em', textAlign: 'right', fontWeight: 'bold' }}>Storage Used</p>
    //         </div>
    //         {data.map((dapp) => <DappItem key={dapp.address} dapp={dapp} />)}
    //         <Button variant='dark' style={{ width: '100px' }} onClick={handleShow}>Add</Button>

    //         <AddContractModal show={showAddModal} close={handleClose} />
    //     </div>
    // );

    // TODO check why data can be undefined
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 12em 12em', width: '100%' }}>
                <span />
                <p style={{ textAlign: 'right', fontWeight: 'bold' }}>Account Balance</p>
                <p style={{ textAlign: 'right', fontWeight: 'bold' }}>Storage Used</p>
                {data!.map((dapp) => <DappItem key={dapp.address} dapp={dapp} />)}
                <Button variant='dark' style={{ width: '100px' }} onClick={handleShow}>Add</Button>

                <AddContractModal show={showAddModal} close={handleClose} />
            </div>
            {isValidating && <Spinner style={{ position: 'absolute', bottom: '0.5em', right: '0.5em' }} animation="border" />}
        </div>
    );
}

interface DappItemProps {
    dapp: Dapp
};
// function DappItem(props: DappItemProps) {
//     return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
//         <a className='link-dark' href={`https://explorer.near.org/accounts/${props.dapp.address}`} target="_blank" rel="noopener noreferrer">{props.dapp.address}</a>
//         <div style={{ display: 'flex', flexDirection: 'row', columnGap: '16px' }}>
//             <p style={{ width: '10em', textAlign: 'right' }}>X.XXX NEAR</p>
//             <p style={{ width: '10em', textAlign: 'right' }}>YYYYYYY B</p>
//         </div>
//         <style jsx>{`
//             a {
//                 text-decoration: underline
//             }
//         `}
//         </style>
//     </div>
// }
function DappItem(props: DappItemProps) {
    return <React.Fragment>
        <div>
            <a className='link-dark' href={`https://explorer.near.org/accounts/${props.dapp.address}`} target="_blank" rel="noopener noreferrer">{props.dapp.address}</a>
        </div>
        <p style={{ textAlign: 'right' }}>X.XXX Ⓝ</p>
        <p style={{ textAlign: 'right' }}>YYYYYYY B</p>
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
                    address: contractAccount
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


    return (
        <Modal show={props.show} onHide={clearAndClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add a Contract</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
                <p>Contract Account Name</p>
                {!addInProgress
                    ? <input type="text" name="contract" value={contractAccount} onChange={(event) => { setContractAccount(event.target.value) }} />
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

export default Console;