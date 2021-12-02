import RecentTransactionList from "../components/RecentTransactionList";
import { useSimpleLayout } from "../utils/layouts";

export default function Recent() {
    return <RecentTransactionList contracts={['test.testnet']} net='TESTNET' />
}

Recent.getLayout = useSimpleLayout;