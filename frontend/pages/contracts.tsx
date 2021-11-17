import { useDashboardLayout } from "../utils/layouts";
import { Button, Spinner } from 'react-bootstrap';
import useSWR from "swr";

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

type NetOption = 'MAINNET' | 'TESTNET';
// TODO extract to central file
interface Contract {
    address: string,
    net: NetOption,
}
const testContracts = [
    {
        address: 'app.nearcrowd.near',
        net: 'MAINNET' as NetOption,
    },
    {
        address: 'michaelpeter.near',
        net: 'MAINNET' as NetOption,
    },
    {
        address: 'bryte.near',
        net: 'MAINNET' as NetOption,
    },
]

function ContractsTable() {
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