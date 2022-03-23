import { ExecutionStatus } from './types';
// import { Translate } from "react-localize-redux";

export interface Props {
  status: ExecutionStatus;
}
const TransactionExecutionStatusComponent = ({ status }: Props) => {
  let statusText;
  switch (status) {
    case 'NotStarted':
      statusText = 'Not started';
      break;
    case 'Started':
      statusText = 'Started';
      break;
    case 'Failure':
      statusText = 'Failed';
      break;
    case 'SuccessValue':
      statusText = 'Succeeded';
      break;
  }
  return <>{statusText}</>;
};

export default TransactionExecutionStatusComponent;
