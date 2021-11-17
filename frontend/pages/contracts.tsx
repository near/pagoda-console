import { useDashboardLayout } from "../utils/layouts";
import { Button, Spinner, Form } from 'react-bootstrap';
import useSWR from "swr";
import { useState } from "react";
import { Contract, NetOption } from "../utils/interfaces";
// import { authenticatedFetcher } from "../utils/fetchers";

// TODO decide proper crash if environment variables are not defined
// and remove unsafe type assertion
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const MAIN_NET_RPC = process.env.NEXT_PUBLIC_MAIN_NET_RPC!;
const TEST_NET_RPC = process.env.NEXT_PUBLIC_TEST_NET_RPC!;

export default function Contracts() {

    return (
        <div id='pageContainer'>
            <div className='titleContainer'>
                <h1>My Cool Project</h1>
            </div>
            <ContractsTable />
            <style jsx>{`
                .pageContainer {
                    display: flex;
                    flex-direction: column;
                    padding: 3rem;
                }
                .titleContainer {
                    margin-bottom: 2.75rem;
                }
            `}</style>
        </div>
    )
}


// TODO extract to central file
const testContracts: Contract[] = [
    {
        id: 1,
        address: 'app.nearcrowd.near',
        environmentId: 1,
        net: 'MAINNET' as NetOption,
    },
    {
        id: 2,
        address: 'michaelpeter.near',
        environmentId: 1,
        net: 'MAINNET' as NetOption,
    },
    {
        id: 3,
        address: 'bryte.near',
        environmentId: 1,
        net: 'MAINNET' as NetOption,
    },
]

function ContractsTable() {
    let [showAdd, setShowAdd] = useState<Boolean>(false);
    // TODO
    // const { data, error }: { data?: Contract[], error?: any } = useSWR([`${BASE_URL}/projects/getContracts`, 'TODO_USER_UID'], authenticatedFetcher)

    return (
        <div className='contractsTableContainer'>
            <div className='headerRow'>
                <h2>Contracts</h2>
                <Button>Edit</Button>
            </div>
            <div className='tableGrid'>
                <span />
                <span className='label'>Account Balance</span>
                <span className='label'>Storage Used</span>
                {testContracts.map(contract => <ContractRow key={contract.address} contract={contract} />)}
                {showAdd && <AddContractForm />}
            </div>
            <div className='buttonContainer'>
                <Button onClick={() => setShowAdd(true)}>{showAdd ? 'Confirm' : 'Add a Contract'}</Button>
                {showAdd && <Button onClick={() => setShowAdd(false)}>Cancel</Button>}
            </div>
            <style jsx>{`
                .headerRow {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                }
                .tableGrid {
                    display: grid;
                    grid-template-columns: auto 10rem 10rem;
                    row-gap: 0.5rem;
                    margin: 1rem 0 1rem;
                }
                .label {
                    text-align: right;
                    font-weight: 700;
                }
                .contractsTableContainer {
                    max-width: 46rem;
                }
                .buttonContainer {
                    display: flex;
                    flex-direction: row;
                    column-gap: 0.75rem;
                }
            `}</style>
        </div>
    );
}

// TODO make placeholder net sensitive
function AddContractForm() {
    let [addInProgress, setAddInProgress] = useState<Boolean>(false);
    return (
        <div className='addContainer'>
            <Form>
                <Form.Control isValid={true} placeholder="contract.near" />
                <Form.Control isInvalid={true} placeholder="contract.near" />
            </Form>
            <Button onClick={() => setAddInProgress(!addInProgress)}>Add</Button>
            <div className='loadingContainer'>
                {addInProgress && <BorderSpinner />}
            </div>
            <style jsx>{`
                .addContainer {
                    display: flex;
                    flex-direction: row;
                    column-gap: 1rem;
                    align-items: center;
                }
                .loadingContainer {
                    width: 3rem;
                }
            `}</style>
        </div>
    );
}

function ContractRow(props: { contract: Contract }) {
    const { data, error } = useSWR([props.contract.address, props.contract.net], async (address: string) => {
        const res = await fetch(props.contract.net === 'MAINNET' ? MAIN_NET_RPC : TEST_NET_RPC, {
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

    return (
        <>
            <a className='explorerLink' href={`https://explorer${props.contract.net === 'TESTNET' ? '.testnet' : ''}.near.org/accounts/${props.contract.address}`} target="_blank" rel="noopener noreferrer">{props.contract.address}</a>
            {data ? <span className='data'>{(data.result.amount / (10 ** 24)).toFixed(5)} Ⓝ</span> : (!error ? <BorderSpinner /> : <span className='data'>N/A</span>)}
            {data ? <span className='data'>{data.result.storage_usage} B</span> : (!error ? <BorderSpinner /> : <span className='data'>N/A</span>)}
            <style jsx>{`
                .explorerLink {
                    font-weight: 600;
                }
                .data {
                    text-align: right;
                }
            `}</style>
        </>
    )
}

// TODO move to component file
function BorderSpinner() {
    return <Spinner style={{ margin: 'auto' }} animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
    </Spinner>
}

Contracts.getLayout = useDashboardLayout;