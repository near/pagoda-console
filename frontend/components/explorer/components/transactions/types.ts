export type ExecutionStatus =
  | "NotStarted"
  | "Started"
  | "Failure"
  | "SuccessValue";

export interface TransactionBaseInfo {
  hash: string;
  signerId: string;
  receiverId: string;
  blockHash: string;
  blockTimestamp: number;
  transactionIndex: number;
  actions: Action[];
}
export type TransactionInfo = TransactionBaseInfo & {
  status?: ExecutionStatus;
};

export interface CreateAccount {}

export interface DeleteAccount {
  beneficiary_id: string;
}

export interface DeployContract {}

export interface FunctionCall {
  args: string;
  deposit: string;
  gas: number;
  method_name: string;
}

export interface Transfer {
  deposit: string;
}

export interface Stake {
  stake: string;
  public_key: string;
}

export interface AddKey {
  access_key: any;
  public_key: string;
}

export interface DeleteKey {
  public_key: string;
}

export interface RpcAction {
  CreateAccount: CreateAccount;
  DeleteAccount: DeleteAccount;
  DeployContract: DeployContract;
  FunctionCall: FunctionCall;
  Transfer: Transfer;
  Stake: Stake;
  AddKey: AddKey;
  DeleteKey: DeleteKey;
}

export interface Action {
  kind: keyof RpcAction;
  args: RpcAction[keyof RpcAction] | {};
}

export interface ReceiptSuccessValue {
  SuccessValue: string | null;
}

export interface ReceiptFailure {
  Failure: any;
}

export interface ReceiptSuccessId {
  SuccessReceiptId: string;
}

export type ReceiptStatus =
  | ReceiptSuccessValue
  | ReceiptFailure
  | ReceiptSuccessId
  | string;

export interface Outcome {
  tokens_burnt: string;
  logs: string[];
  receipt_ids: string[];
  status: ReceiptStatus;
  gas_burnt: number;
}

export interface ReceiptOutcome {
  id: string;
  outcome: Outcome;
  block_hash: string;
}

export interface ReceiptsOutcomeWrapper {
  receiptsOutcome?: ReceiptOutcome[];
}
interface RpcReceipt {
  predecessor_id: string;
  receiver_id: string;
  receipt_id: string;
  receipt?: any;
  actions?: Action[];
}
export interface NestedReceiptWithOutcome {
  actions?: Action[];
  block_hash: string;
  outcome: ReceiptExecutionOutcome;
  predecessor_id: string;
  receipt_id: string;
  receiver_id: string;
}

export interface ReceiptExecutionOutcome {
  tokens_burnt: string;
  logs: string[];
  outgoing_receipts?: NestedReceiptWithOutcome[];
  status: ReceiptStatus;
  gas_burnt: number;
}

export interface TransactionOutcome {
  id: string;
  outcome: Outcome;
  block_hash: string;
}

export interface TransactionOutcomeWrapper {
  transactionOutcome?: TransactionOutcome;
}

export type Transaction = TransactionInfo &
  ReceiptsOutcomeWrapper &
  TransactionOutcomeWrapper & { receipt?: NestedReceiptWithOutcome } &
  {sourceContract?: string}; // custom for console

export interface TxPagination {
  endTimestamp: number;
  transactionIndex: number;
}

export interface Receipt {
    actions: Action[];
    blockTimestamp: number;
    receiptId: string;
    gasBurnt: number;
    receiverId: string;
    signerId: string;
    status?: ReceiptExecutionStatus;
    originatedFromTransactionHash?: string | null;
    tokensBurnt: string;
  }
  
  export type ReceiptExecutionStatus =
    | "Unknown"
    | "Failure"
    | "SuccessValue"
    | "SuccessReceiptId";