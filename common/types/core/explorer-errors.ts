import { z } from 'zod';
import { accountId, yoctoNear } from './types';

export const unknownError = z.strictObject({ type: z.literal('unknown') });
export type UnknownError = z.infer<typeof unknownError>;

const compilationError = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('codeDoesNotExist'), accountId }),
  z.strictObject({ type: z.literal('prepareError') }),
  z.strictObject({ type: z.literal('wasmerCompileError'), msg: z.string() }),
  z.strictObject({ type: z.literal('unsupportedCompiler'), msg: z.string() }),
  unknownError,
]);
export type CompilationError = z.infer<typeof compilationError>;

const functionCallError = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('compilationError'),
    error: compilationError,
  }),
  z.strictObject({ type: z.literal('linkError'), msg: z.string() }),
  z.strictObject({ type: z.literal('methodResolveError') }),
  z.strictObject({ type: z.literal('wasmTrap') }),
  z.strictObject({ type: z.literal('wasmUnknownError') }),
  z.strictObject({ type: z.literal('hostError') }),
  z.strictObject({ type: z.literal('evmError') }),
  z.strictObject({ type: z.literal('executionError'), error: z.string() }),
  unknownError,
]);
export type FunctionCallError = z.infer<typeof functionCallError>;

const newReceiptValidationError = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('invalidPredecessorId'), accountId }),
  z.strictObject({ type: z.literal('invalidReceiverId'), accountId }),
  z.strictObject({ type: z.literal('invalidSignerId'), accountId }),
  z.strictObject({ type: z.literal('invalidDataReceiverId'), accountId }),
  z.strictObject({
    type: z.literal('returnedValueLengthExceeded'),
    length: z.number(),
    limit: z.number(),
  }),
  z.strictObject({
    type: z.literal('numberInputDataDependenciesExceeded'),
    numberOfInputDataDependencies: z.number(),
    limit: z.number(),
  }),
  z.strictObject({ type: z.literal('actionsValidation') }),
  unknownError,
]);
export type NewReceiptValidationError = z.infer<
  typeof newReceiptValidationError
>;

const receiptActionError = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('accountAlreadyExists'), accountId }),
  z.strictObject({ type: z.literal('accountDoesNotExist'), accountId }),
  z.strictObject({
    type: z.literal('createAccountOnlyByRegistrar'),
    accountId,
    registrarAccountId: accountId,
    predecessorId: accountId,
  }),
  z.strictObject({
    type: z.literal('createAccountNotAllowed'),
    accountId,
    predecessorId: accountId,
  }),
  z.strictObject({
    type: z.literal('actorNoPermission'),
    accountId,
    actorId: accountId,
  }),
  z.strictObject({
    type: z.literal('deleteKeyDoesNotExist'),
    accountId,
    publicKey: z.string(),
  }),
  z.strictObject({
    type: z.literal('addKeyAlreadyExists'),
    accountId,
    publicKey: z.string(),
  }),
  z.strictObject({ type: z.literal('deleteAccountStaking'), accountId }),
  z.strictObject({
    type: z.literal('lackBalanceForState'),
    accountId,
    amount: yoctoNear,
  }),
  z.strictObject({ type: z.literal('triesToUnstake'), accountId }),
  z.strictObject({
    type: z.literal('triesToStake'),
    accountId,
    stake: yoctoNear,
    locked: yoctoNear,
    balance: yoctoNear,
  }),
  z.strictObject({
    type: z.literal('insufficientStake'),
    accountId,
    stake: yoctoNear,
    minimumStake: yoctoNear,
  }),
  z.strictObject({
    type: z.literal('functionCallError'),
    error: functionCallError,
  }),
  z.strictObject({
    type: z.literal('newReceiptValidationError'),
    error: newReceiptValidationError,
  }),
  z.strictObject({
    type: z.literal('onlyImplicitAccountCreationAllowed'),
    accountId,
  }),
  z.strictObject({ type: z.literal('deleteAccountWithLargeState'), accountId }),
  unknownError,
]);
export type ReceiptActionError = z.infer<typeof receiptActionError>;

const receiptTransactionError = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('invalidAccessKeyError'),
  }),
  z.strictObject({
    type: z.literal('invalidSignerId'),
    signerId: accountId,
  }),
  z.strictObject({
    type: z.literal('signerDoesNotExist'),
    signerId: accountId,
  }),
  z.strictObject({
    type: z.literal('invalidNonce'),
    transactionNonce: z.number(),
    akNonce: z.number(),
  }),
  z.strictObject({
    type: z.literal('nonceTooLarge'),
    transactionNonce: z.number(),
    upperBound: z.number(),
  }),
  z.strictObject({
    type: z.literal('invalidReceiverId'),
    receiverId: accountId,
  }),
  z.strictObject({
    type: z.literal('invalidSignature'),
  }),
  z.strictObject({
    type: z.literal('notEnoughBalance'),
    signerId: accountId,
    balance: yoctoNear,
    cost: yoctoNear,
  }),
  z.strictObject({
    type: z.literal('lackBalanceForState'),
    signerId: accountId,
    amount: yoctoNear,
  }),
  z.strictObject({
    type: z.literal('costOverflow'),
  }),
  z.strictObject({
    type: z.literal('invalidChain'),
  }),
  z.strictObject({
    type: z.literal('expired'),
  }),
  z.strictObject({
    type: z.literal('actionsValidation'),
  }),
  z.strictObject({
    type: z.literal('transactionSizeExceeded'),
    size: z.number(),
    limit: z.number(),
  }),
  z.strictObject({
    type: z.literal('unknown'),
  }),
]);
export type ReceiptTransactionError = z.infer<typeof receiptTransactionError>;

export const receiptExecutionStatusError = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('action'), error: receiptActionError }),
  z.strictObject({
    type: z.literal('transaction'),
    error: receiptTransactionError,
  }),
  unknownError,
]);
export type ReceiptExecutionStatusError = z.infer<
  typeof receiptExecutionStatusError
>;
