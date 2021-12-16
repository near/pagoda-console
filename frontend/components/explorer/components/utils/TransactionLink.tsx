import { NetOption } from "../../../../utils/interfaces";
import mixpanel from 'mixpanel-browser';

export interface Props {
  transactionHash: string;
  children?: React.ReactNode;
  net: NetOption;
}

// const TransactionLink = ({ transactionHash, children }: Props) => (
//   <Link href="/transactions/[hash]" as={`/transactions/${transactionHash}`}>
//     <a className="transaction-link">
//       {children || `${transactionHash.substring(0, 7)}...`}
//     </a>
//   </Link>
// );

const TransactionLink = ({ transactionHash, children, net }: Props) => (
  <a onClick={() => mixpanel.track('DC Recent transactions tx link')} className="transaction-link" href={`https://explorer${net === "TESTNET" ? ".testnet" : ""}.near.org/transactions/${transactionHash}`} target="_blank" rel="noopener noreferrer">
    {children || `${transactionHash.substring(0, 7)}...`}
  </a>
);

export default TransactionLink;
