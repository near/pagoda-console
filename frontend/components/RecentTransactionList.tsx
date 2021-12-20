import { useState, useEffect } from "react";
import { authenticatedPost, useRecentTransactions } from "../utils/fetchers";
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

export default function RecentTransactionList({ contracts, net }: { contracts: Contract[], net: NetOption; }) {
    // let [transactions, setTransactions] = useState<Transaction[]>();
    const identity = useIdentity();

    const [finalityStatus, setFinalityStatus] = useState<FinalityStatus>();

    const { transactions, error } = useRecentTransactions(contracts.map(c => c.address), net);

    // fetch finality
    useEffect(() => {
        // TODO convert finality fetch to SWR, possibly even with polling, to make data more realtime
        fetchFinality(net);
    }, [net]);

    async function fetchFinality(net: NetOption) {
        const res = await fetch(
            Config.url.rpc.default[net],
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

    return (
        <div>
            <h2>Recent Transactions</h2>
            {transactions && transactions.map(t => {
                return (
                    <div key={t.hash} style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ flexGrow: 1 }}>
                            <TransactionAction transaction={t} net={net} finalityStatus={finalityStatus} />
                        </div>
                        <span style={{ marginTop: 'auto', marginBottom: 'auto', color: 'var(--color-text-secondary)', paddingLeft: '1rem' }}>{t.sourceContract}</span>
                    </div>
                );
            })}
        </div>
    );
}