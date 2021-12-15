import Link from "../utils/Link";
import { truncateAccountId } from "../../libraries/formatting";
import { NetOption } from "../../../../utils/interfaces";

export interface Props {
  accountId: string;
}

// const AccountLink = ({ accountId }: Props) => {
//   return (
//     <>
//       <Link href="/accounts/[id]" as={`/accounts/${accountId}`}>
//         <a className="account-link">{truncateAccountId(accountId)}</a>
//       </Link>
//       <style jsx>{`
//         .account-link {
//           white-space: nowrap;
//         }
//       `}</style>
//     </>
//   );
// };

const AccountLink = ({ accountId }: Props) => {
  let net: NetOption | null;
  if (accountId.endsWith('.near')) {
    net = 'MAINNET';
  } else if (accountId.endsWith('.testnet')) {
    net = 'TESTNET';
  } else {
    net = null;
  }

  return (
    <>
      <a className="account-link" href={!net ? undefined : `https://explorer${net === "TESTNET" ? ".testnet" : ""}.near.org/accounts/${accountId}`} target="_blank" rel="noopener noreferrer">{truncateAccountId(accountId)}</a>
      <style jsx>{`
        .account-link {
          white-space: nowrap;
        }
      `}</style>
    </>
  );
};

export default AccountLink;
