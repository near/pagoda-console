import { ExecutionOutcomeStatus } from './models/readOnlyIndexer';
import * as RPC from '@pc/common/types/rpc';
import { Explorer } from '@pc/common/types/core';

const UNKNOWN_ERROR: Explorer.Errors.UnknownError = { type: 'unknown' };

const mapRpcCompilationError = (
  error: RPC.CompilationError,
): Explorer.Errors.CompilationError => {
  if ('CodeDoesNotExist' in error) {
    return {
      type: 'codeDoesNotExist',
      accountId: error.CodeDoesNotExist.account_id as Explorer.AccountId,
    };
  }
  if ('PrepareError' in error) {
    return {
      type: 'prepareError',
    };
  }
  if ('WasmerCompileError' in error) {
    return {
      type: 'wasmerCompileError',
      msg: error.WasmerCompileError.msg,
    };
  }
  if ('UnsupportedCompiler' in error) {
    return {
      type: 'unsupportedCompiler',
      msg: error.UnsupportedCompiler.msg,
    };
  }
  return UNKNOWN_ERROR;
};

const mapRpcFunctionCallError = (
  error: RPC.FunctionCallError,
): Explorer.Errors.FunctionCallError => {
  if ('CompilationError' in error) {
    return {
      type: 'compilationError',
      error: mapRpcCompilationError(error.CompilationError),
    };
  }
  if ('LinkError' in error) {
    return {
      type: 'linkError',
      msg: error.LinkError.msg,
    };
  }
  if ('MethodResolveError' in error) {
    return {
      type: 'methodResolveError',
    };
  }
  if ('WasmTrap' in error) {
    return {
      type: 'wasmTrap',
    };
  }
  if ('WasmUnknownError' in error) {
    return {
      type: 'wasmUnknownError',
    };
  }
  if ('HostError' in error) {
    return {
      type: 'hostError',
    };
  }
  if ('_EVMError' in error) {
    return {
      type: 'evmError',
    };
  }
  if ('ExecutionError' in error) {
    return {
      type: 'executionError',
      error: error.ExecutionError,
    };
  }
  return UNKNOWN_ERROR;
};
const mapRpcNewReceiptValidationError = (
  error: RPC.NewReceiptValidationError,
): Explorer.Errors.NewReceiptValidationError => {
  if ('InvalidPredecessorId' in error) {
    return {
      type: 'invalidPredecessorId',
      accountId: error.InvalidPredecessorId.account_id as Explorer.AccountId,
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      type: 'invalidReceiverId',
      accountId: error.InvalidReceiverId.account_id as Explorer.AccountId,
    };
  }
  if ('InvalidSignerId' in error) {
    return {
      type: 'invalidSignerId',
      accountId: error.InvalidSignerId.account_id as Explorer.AccountId,
    };
  }
  if ('InvalidDataReceiverId' in error) {
    return {
      type: 'invalidDataReceiverId',
      accountId: error.InvalidDataReceiverId.account_id as Explorer.AccountId,
    };
  }
  if ('ReturnedValueLengthExceeded' in error) {
    return {
      type: 'returnedValueLengthExceeded',
      length: error.ReturnedValueLengthExceeded.length,
      limit: error.ReturnedValueLengthExceeded.limit,
    };
  }
  if ('NumberInputDataDependenciesExceeded' in error) {
    return {
      type: 'numberInputDataDependenciesExceeded',
      numberOfInputDataDependencies:
        error.NumberInputDataDependenciesExceeded
          .number_of_input_data_dependencies,
      limit: error.NumberInputDataDependenciesExceeded.limit,
    };
  }
  if ('ActionsValidation' in error) {
    return {
      type: 'actionsValidation',
    };
  }
  return UNKNOWN_ERROR;
};

const mapRpcReceiptError = (
  error: RPC.TxExecutionError,
): Explorer.Errors.ReceiptExecutionStatusError => {
  if ('ActionError' in error) {
    return {
      type: 'action',
      error: mapRpcReceiptActionError(error.ActionError),
    };
  }
  if ('InvalidTxError' in error) {
    return {
      type: 'transaction',
      error: mapRpcReceiptInvalidTxError(error.InvalidTxError),
    };
  }
  return UNKNOWN_ERROR;
};

const mapRpcReceiptInvalidTxError = (
  error: RPC.InvalidTxError,
): Explorer.Errors.ReceiptTransactionError => {
  if ('InvalidAccessKeyError' in error) {
    return {
      type: 'invalidAccessKeyError',
    };
  }
  if ('InvalidSignerId' in error) {
    return {
      type: 'invalidSignerId',
      signerId: error.InvalidSignerId.signer_id as Explorer.AccountId,
    };
  }
  if ('SignerDoesNotExist' in error) {
    return {
      type: 'signerDoesNotExist',
      signerId: error.SignerDoesNotExist.signer_id as Explorer.AccountId,
    };
  }
  if ('InvalidNonce' in error) {
    return {
      type: 'invalidNonce',
      transactionNonce: error.InvalidNonce.tx_nonce,
      akNonce: error.InvalidNonce.ak_nonce,
    };
  }
  if ('NonceTooLarge' in error) {
    return {
      type: 'nonceTooLarge',
      transactionNonce: error.NonceTooLarge.tx_nonce,
      upperBound: error.NonceTooLarge.upper_bound,
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      type: 'invalidReceiverId',
      receiverId: error.InvalidReceiverId.receiver_id as Explorer.AccountId,
    };
  }
  if ('InvalidSignature' in error) {
    return {
      type: 'invalidSignature',
    };
  }
  if ('NotEnoughBalance' in error) {
    return {
      type: 'notEnoughBalance',
      signerId: error.NotEnoughBalance.signer_id as Explorer.AccountId,
      balance: error.NotEnoughBalance.balance as Explorer.YoctoNear,
      cost: error.NotEnoughBalance.cost as Explorer.YoctoNear,
    };
  }
  if ('LackBalanceForState' in error) {
    return {
      type: 'lackBalanceForState',
      signerId: error.LackBalanceForState.signer_id as Explorer.AccountId,
      amount: error.LackBalanceForState.amount as Explorer.YoctoNear,
    };
  }
  if ('CostOverflow' in error) {
    return {
      type: 'costOverflow',
    };
  }
  if ('InvalidChain' in error) {
    return {
      type: 'invalidChain',
    };
  }
  if ('Expired' in error) {
    return {
      type: 'expired',
    };
  }
  if ('ActionsValidation' in error) {
    return {
      type: 'actionsValidation',
    };
  }
  if ('TransactionSizeExceeded' in error) {
    return {
      type: 'transactionSizeExceeded',
      size: error.TransactionSizeExceeded.size,
      limit: error.TransactionSizeExceeded.limit,
    };
  }
  return UNKNOWN_ERROR;
};

const mapRpcReceiptActionError = (
  error: RPC.ActionError,
): Explorer.Errors.ReceiptActionError => {
  const kind = error.kind;
  if ('AccountAlreadyExists' in kind) {
    return {
      type: 'accountAlreadyExists',
      accountId: kind.AccountAlreadyExists.account_id as Explorer.AccountId,
    };
  }
  if ('AccountDoesNotExist' in kind) {
    return {
      type: 'accountDoesNotExist',
      accountId: kind.AccountDoesNotExist.account_id as Explorer.AccountId,
    };
  }
  if ('CreateAccountOnlyByRegistrar' in kind) {
    return {
      type: 'createAccountOnlyByRegistrar',
      accountId: kind.CreateAccountOnlyByRegistrar
        .account_id as Explorer.AccountId,
      registrarAccountId: kind.CreateAccountOnlyByRegistrar
        .registrar_account_id as Explorer.AccountId,
      predecessorId: kind.CreateAccountOnlyByRegistrar
        .predecessor_id as Explorer.AccountId,
    };
  }
  if ('CreateAccountNotAllowed' in kind) {
    return {
      type: 'createAccountNotAllowed',
      accountId: kind.CreateAccountNotAllowed.account_id as Explorer.AccountId,
      predecessorId: kind.CreateAccountNotAllowed
        .predecessor_id as Explorer.AccountId,
    };
  }
  if ('ActorNoPermission' in kind) {
    return {
      type: 'actorNoPermission',
      accountId: kind.ActorNoPermission.account_id as Explorer.AccountId,
      actorId: kind.ActorNoPermission.actor_id as Explorer.AccountId,
    };
  }
  if ('DeleteKeyDoesNotExist' in kind) {
    return {
      type: 'deleteKeyDoesNotExist',
      accountId: kind.DeleteKeyDoesNotExist.account_id as Explorer.AccountId,
      publicKey: kind.DeleteKeyDoesNotExist.public_key,
    };
  }
  if ('AddKeyAlreadyExists' in kind) {
    return {
      type: 'addKeyAlreadyExists',
      accountId: kind.AddKeyAlreadyExists.account_id as Explorer.AccountId,
      publicKey: kind.AddKeyAlreadyExists.public_key,
    };
  }
  if ('DeleteAccountStaking' in kind) {
    return {
      type: 'deleteAccountStaking',
      accountId: kind.DeleteAccountStaking.account_id as Explorer.AccountId,
    };
  }
  if ('LackBalanceForState' in kind) {
    return {
      type: 'lackBalanceForState',
      accountId: kind.LackBalanceForState.account_id as Explorer.AccountId,
      amount: kind.LackBalanceForState.amount as Explorer.YoctoNear,
    };
  }
  if ('TriesToUnstake' in kind) {
    return {
      type: 'triesToUnstake',
      accountId: kind.TriesToUnstake.account_id as Explorer.AccountId,
    };
  }
  if ('TriesToStake' in kind) {
    return {
      type: 'triesToStake',
      accountId: kind.TriesToStake.account_id as Explorer.AccountId,
      stake: kind.TriesToStake.stake as Explorer.YoctoNear,
      locked: kind.TriesToStake.locked as Explorer.YoctoNear,
      balance: kind.TriesToStake.balance as Explorer.YoctoNear,
    };
  }
  if ('InsufficientStake' in kind) {
    return {
      type: 'insufficientStake',
      accountId: kind.InsufficientStake.account_id as Explorer.AccountId,
      stake: kind.InsufficientStake.stake as Explorer.YoctoNear,
      minimumStake: kind.InsufficientStake.minimum_stake as Explorer.YoctoNear,
    };
  }
  if ('FunctionCallError' in kind) {
    return {
      type: 'functionCallError',
      error: mapRpcFunctionCallError(kind.FunctionCallError),
    };
  }
  if ('NewReceiptValidationError' in kind) {
    return {
      type: 'newReceiptValidationError',
      error: mapRpcNewReceiptValidationError(kind.NewReceiptValidationError),
    };
  }
  if ('OnlyImplicitAccountCreationAllowed' in kind) {
    return {
      type: 'onlyImplicitAccountCreationAllowed',
      accountId: kind.OnlyImplicitAccountCreationAllowed
        .account_id as Explorer.AccountId,
    };
  }
  if ('DeleteAccountWithLargeState' in kind) {
    return {
      type: 'deleteAccountWithLargeState',
      accountId: kind.DeleteAccountWithLargeState
        .account_id as Explorer.AccountId,
    };
  }
  return UNKNOWN_ERROR;
};

export const mapRpcReceiptStatus = (
  status: RPC.ExecutionStatusView,
): Explorer.ReceiptExecutionStatus => {
  if ('SuccessValue' in status) {
    return { type: 'successValue', value: status.SuccessValue };
  }
  if ('SuccessReceiptId' in status) {
    return {
      type: 'successReceiptId',
      receiptId: status.SuccessReceiptId as Explorer.ReceiptId,
    };
  }
  if ('Failure' in status) {
    return { type: 'failure', error: mapRpcReceiptError(status.Failure) };
  }
  return { type: 'unknown' };
};

export const mapDatabaseReceiptStatus = (
  status: ExecutionOutcomeStatus,
): Explorer.ReceiptExecutionStatus['type'] => {
  switch (status) {
    case 'SUCCESS_RECEIPT_ID':
      return 'successReceiptId';
    case 'SUCCESS_VALUE':
      return 'successValue';
    case 'FAILURE':
      return 'failure';
    default:
      return 'unknown';
  }
};
