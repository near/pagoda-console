import { useDashboardLayout } from "../../utils/layouts";
import { Button, Spinner, Form } from 'react-bootstrap';
import useSWR from "swr";
import { ChangeEvent, useState } from "react";
import { Contract, NetOption } from "../../utils/interfaces";
import { authenticatedPost, useContracts, useEnvironment } from "../../utils/fetchers";
import { getAuth } from 'firebase/auth';
import { useIdentity } from "../../utils/hooks";
import { useRouter } from "next/router";

// TODO decide proper crash if environment variables are not defined
// and remove unsafe type assertion
const MAIN_NET_RPC = process.env.NEXT_PUBLIC_MAIN_NET_RPC!;
const TEST_NET_RPC = process.env.NEXT_PUBLIC_TEST_NET_RPC!;

export default function Contracts() {
    const router = useRouter()
    const { environment: environmentParam } = router.query;
    let environmentId: number | null = null;
    if (environmentParam && typeof environmentParam === 'string') {
        environmentId = parseInt(environmentParam) || null;
    }

    let { environment, error } = useEnvironment(environmentId);

    let user = useIdentity();
    console.log(user);

    if (!user) {
        return <BorderSpinner />;
    }

    // TODO (NTH) lean into automatic static optimization and rework checks so that the
    // maximum amount of elements can be rendered without environmentId
    return (
        <div id='pageContainer'>
            <div className='titleContainer'>
                <h1>{environment?.project?.name || 'Loading...'}</h1>
            </div>
            {environmentId && <ContractsTable environmentId={environmentId} />}
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

function ContractsTable(props: { environmentId: number }) {


    const { contracts, error, mutate: mutateContracts } = useContracts(props.environmentId);
    // TODO determine how to not retry on 400s

    if (!contracts && !error) {
        //loading
        return <BorderSpinner />
    }
    if (error) {
        // TODO
        return <div>Something went wrong: {error.message}</div>
    }
    if (contracts && !contracts.length) {
        return <ContractsEmptyState />
    }
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
                {contracts && contracts.map(contract => <ContractRow key={contract.address} contract={contract} />)}
            </div>
            <AddContractForm environmentId={props.environmentId} onAdd={mutateContracts} />

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
                
            `}</style>
        </div>
    );
}

function ContractsEmptyState() {
    return <div>No contracts</div>;
}

// TODO make placeholder net sensitive
function AddContractForm(props: { environmentId: number, onAdd: () => void }) {
    let [showAdd, setShowAdd] = useState<boolean>(false);
    let [addInProgress, setAddInProgress] = useState<boolean>(false);
    let [address, setAddress] = useState<string>('');
    let [error, setError] = useState<string>('');

    async function submitNewContract() {
        setAddInProgress(true);
        let contract: Contract;
        try {
            // throw new Error();
            contract = await authenticatedPost('/projects/addContract', { environmentId: props.environmentId, address });
            // contract = await authenticatedPost('/projects/addContract', { environmentId: 40, address });
            props.onAdd();
            closeAdd();
            return contract;
        } catch (e: any) {
            // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO 
            // alert(e.message);
            setError(e.message);
        } finally {
            setAddInProgress(false);
        }
    }

    function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
        error && setError('');
        setAddress(e.target.value);
    }

    function closeAdd() {
        setAddress('');
        setShowAdd(false);
    }

    return (
        <div className='addContainer'>
            {showAdd && <div className='inputRow'>
                <Form>
                    <Form.Control isInvalid={Boolean(error)} disabled={addInProgress} placeholder="contract.near" value={address} onChange={handleAddressChange} />
                    <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
                </Form>
                <div className='loadingContainer'>
                    {addInProgress && <BorderSpinner />}
                </div>
            </div>}
            <div className='buttonContainer'>
                <Button disabled={addInProgress} onClick={showAdd ? submitNewContract : () => setShowAdd(true)}>{showAdd ? 'Confirm' : 'Add a Contract'}</Button>
                {showAdd && <Button disabled={addInProgress} onClick={closeAdd}>Cancel</Button>}
            </div>
            <style jsx>{`
                .addContainer {
                    display: flex;
                    flex-direction: column;
                    row-gap: 1em;
                }
                .inputRow {
                    display: flex;
                    flex-direction: row;
                    column-gap: 1rem;
                    align-items: center;
                }
                .loadingContainer {
                    width: 3rem;
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