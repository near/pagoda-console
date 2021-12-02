import { useState, useEffect } from "react";
import { authenticatedPost } from "../utils/fetchers";
import { useIdentity } from "../utils/hooks";
import TransactionAction from "./explorer/components/transactions/TransactionAction";
import { Transaction } from "./explorer/components/transactions/types";
import { Contract, NetOption } from "../utils/interfaces";
import Config from '../utils/config';

import BN from "bn.js";
export interface FinalityStatus {
    finalBlockHeight: number;
    finalBlockTimestampNanosecond: BN;
}

export default function RecentTransactionList({ contracts, net }: { contracts: Contract[], net: NetOption }) {
    let [transactions, setTransactions] = useState<Transaction[]>();
    const identity = useIdentity();

    const [finalityStatus, setFinalityStatus] = useState<FinalityStatus>();

    useEffect(() => {
        fetchTransactions(contracts.map(c => c.address), net)
    }, [contracts, net]);

    async function fetchTransactions(contracts: string[], net: NetOption) {
        let res = await authenticatedPost('/projects/getTransactions', {
            contracts,
            net
        });
        setTransactions(res);
    }

    // fetch finality
    useEffect(() => {
        // TODO convert finality fetch to SWR, possibly even with polling, to make data more realtime
        fetchFinality(net);
    }, [net]);

    async function fetchFinality(net: NetOption) {
        const res = await fetch(
            // TODO change from locking into archival
            net === "MAINNET" ? Config.url.rpc.mainnet : Config.url.rpc.testnetArchival,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": "dontcare",
                    "method": "block",
                    "params": {
                        "finality": "final"
                    }
                }),
            }
        ).then((res) => res.json());
        if (res.error) {
            // TODO decide whether to retry error
            throw new Error(res.error.name);
        }
        const finalBlock = res.result;
        const newStatus = {
            finalBlockTimestampNanosecond: new BN(finalBlock.header.timestamp_nanosec),
            finalBlockHeight: finalBlock.header.height,
        };
        // debugger;
        setFinalityStatus(newStatus);
    }

    // TODO temporarily hardcoded to testnet
    // return (
    //     <div>
    //         {transactions && transactions.map(t => <TransactionAction key={t.hash} transaction={t} net={'TESTNET'} />)}
    //     </div>
    // )
    return (
        <div>
            <h2>Recent Transactions</h2>
            {transactions && transactions.map(t => {
                return (
                    <div key={t.hash} style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ flexGrow: 1 }}>
                            <TransactionAction transaction={t} net={'TESTNET'} finalityStatus={finalityStatus} />
                        </div>
                        <span style={{ marginTop: 'auto', marginBottom: 'auto', color: 'var(--color-text-secondary)', paddingLeft: '1rem' }}>{t.sourceContract}</span>
                    </div>
                );
            })}
        </div>
    );
}