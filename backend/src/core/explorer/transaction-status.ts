import { ExecutionOutcomeStatus } from './models/readOnlyIndexer';
import { Explorer } from '@pc/common/types/core';
import * as RPC from '@pc/common/types/rpc';

export const mapRpcTransactionStatus = (
  status: RPC.FinalExecutionStatus,
): Explorer.TransactionStatus => {
  if ('SuccessValue' in status) {
    return 'success';
  }
  if ('Failure' in status) {
    return 'failure';
  }
  return 'unknown';
};

export const mapDatabaseTransactionStatus = (
  status: ExecutionOutcomeStatus,
): Explorer.TransactionStatus => {
  switch (status) {
    case 'SUCCESS_VALUE':
    case 'SUCCESS_RECEIPT_ID':
      return 'success';
    case 'FAILURE':
      return 'failure';
    default:
      return 'unknown';
  }
};
