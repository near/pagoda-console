/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VError } from 'verror';
import { ExpressionBuilder, Kysely, PostgresDialect, sql } from 'kysely';
import { Pool, PoolConfig } from 'pg';
import {
  DatabaseAction,
  mapDatabaseActionToAction,
  mapRpcActionToAction,
} from './actions';
import {
  mapDatabaseTransactionStatus,
  mapRpcTransactionStatus,
} from './transaction-status';
import * as Indexer from './models/readOnlyIndexer';
import * as IndexerActivity from './models/readOnlyIndexerActivity';
import { Net } from '@pc/database/clients/core';
import { StringReference } from 'kysely/dist/cjs/parser/reference-parser';
import { ExtractColumnType } from 'kysely/dist/cjs/util/type-utils';
import { AppConfig } from '../../config/validate';
import { NearRpcService } from '../near-rpc/near-rpc.service';
import * as RPC from '@pc/common/types/rpc';
import { mapRpcReceiptStatus } from './receipt-status';
import { Explorer } from '@pc/common/types/core';

type BasePreview = {
  signerId: string;
  receiverId: string;
  actions: Explorer.Action[];
};

type TransactionPreview = BasePreview & {
  type: 'transaction';
  hash: string;
  status: Explorer.TransactionStatus;
};

type ReceiptPreview = BasePreview & {
  type: 'receipt';
  originatedFromTransactionHash: string;
  receiptId: string;
};

const nanosecondsToMilliseconds = (ns: bigint): number => {
  return Number(ns / BigInt(10 ** 6));
};

const notNullGuard = <T>(arg: T): arg is Exclude<T, null> => {
  return arg !== null;
};

const getPgPool = (config: PoolConfig): Pool => {
  const pool = new Pool(config);
  pool.on('error', (error) => {
    console.error(`Pool ${config.database} failed: ${String(error)}`);
  });
  pool.on('connect', (connection) => {
    connection.on('error', (error) =>
      console.error(`Client ${config.database} failed: ${String(error)}`),
    );
  });
  return pool;
};

const getKysely = <T>(config: PoolConfig): Kysely<T> =>
  new Kysely<T>({
    dialect: new PostgresDialect({ pool: getPgPool(config) }),
  });

const div = <DB, TB extends keyof DB, C extends string>(
  _eb: ExpressionBuilder<DB, TB>,
  column: StringReference<DB, TB>,
  times: number,
  alias: C,
) => {
  // TODO: Evaluation of column type extraction is not correct
  // See example with 'deletion_receipt' table join
  // 'deleted_at_block_timestamp' field should be null-able
  return sql<
    ExtractColumnType<DB, TB, StringReference<DB, TB>> extends null
      ? string | null
      : string
  >`div(${sql.ref(column)}, ${times})`.as(alias);
};

type AccountActivityCursor = {
  blockTimestamp: string;
  shardId: number;
  indexInChunk: number;
};

const queryBalanceChanges = (
  activityDatabase: Kysely<IndexerActivity.ModelTypeMap>,
  accountId: string,
  limit: number,
  cursor?: AccountActivityCursor,
) => {
  let selection = activityDatabase
    .selectFrom('balance_changes')
    .select([
      'involved_account_id as involvedAccountId',
      'block_timestamp as blockTimestamp',
      'shard_id as shardId',
      'index_in_chunk as indexInChunk',
      'transaction_hash as transactionHash',
      'receipt_id as receiptId',
      'direction',
      'cause',
      'status',
      'delta_nonstaked_amount as deltaNonStakedAmount',
    ])
    .where('affected_account_id', '=', accountId)
    // filter out gas rewards
    .where('cause', '<>', 'CONTRACT_REWARD')
    // filter out (some) refunds
    .where('involved_account_id', 'is not', null)
    .where((qb) =>
      // filter out outbound receipts
      qb.where('receipt_id', '<>', null).orWhere('direction', '=', 'INBOUND'),
    );
  if (cursor) {
    selection = selection
      .where('block_timestamp', '<=', cursor.blockTimestamp)
      .where('shard_id', '<=', cursor.shardId)
      .where('index_in_chunk', '<=', cursor.indexInChunk)
      .offset(1);
  }
  return selection
    .orderBy('block_timestamp', 'desc')
    .orderBy('shard_id', 'desc')
    .orderBy('index_in_chunk', 'desc')
    .limit(limit)
    .execute();
};

const queryReceiptsByIds = async (
  indexerDatabase: Kysely<Indexer.ModelTypeMap>,
  ids: string[],
) => {
  return indexerDatabase
    .selectFrom('action_receipt_actions')
    .innerJoin('receipts', (jb) =>
      jb.onRef('receipts.receipt_id', '=', 'action_receipt_actions.receipt_id'),
    )
    .innerJoin('execution_outcomes', (jb) =>
      jb.onRef(
        'execution_outcomes.receipt_id',
        '=',
        'action_receipt_actions.receipt_id',
      ),
    )
    .select([
      'action_receipt_actions.receipt_id as id',
      'originated_from_transaction_hash as originatedFromTransactionHash',
      'predecessor_account_id as predecessorId',
      'receiver_account_id as receiverId',
      'status',
      'executed_in_block_timestamp as blockTimestamp',
      'action_kind as kind',
      'args',
    ])
    .where('action_receipt_actions.receipt_id', 'in', ids)
    .where('receipt_kind', '=', 'ACTION')
    .execute();
};

const getIdsFromAccountChanges = (
  changes: Awaited<ReturnType<typeof queryBalanceChanges>>,
) => {
  return changes.reduce<{
    receiptIds: string[];
    transactionHashes: string[];
    blocksTimestamps: string[];
  }>(
    (acc, change) => {
      switch (change.cause) {
        case 'RECEIPT':
          acc.receiptIds.push(change.receiptId!);
          break;
        case 'TRANSACTION':
          acc.transactionHashes.push(change.transactionHash!);
          break;
        case 'VALIDATORS_REWARD':
          acc.blocksTimestamps.push(change.blockTimestamp);
      }
      return acc;
    },
    {
      receiptIds: [],
      transactionHashes: [],
      blocksTimestamps: [],
    },
  );
};

const getActivityAction = (
  actions: Explorer.Action[],
): Explorer.AccountActivityAction => {
  if (actions.length === 0) {
    throw new Error('Unexpected zero-length array of actions');
  }
  if (actions.length !== 1) {
    return {
      kind: 'batch',
      actions: actions.map((action) => getActivityAction([action])),
    };
  }
  return actions[0];
};

const withActivityConnection = <T>(
  input: T,
  source?: TransactionPreview | ReceiptPreview,
): T & Pick<Explorer.ActivityConnection, 'transactionHash' | 'receiptId'> => {
  if (!source) {
    return {
      ...input,
      transactionHash: '',
    };
  }
  if ('receiptId' in source) {
    return {
      ...input,
      transactionHash: source.originatedFromTransactionHash,
      receiptId: source.receiptId,
    };
  }
  return {
    ...input,
    transactionHash: source.hash,
  };
};

const withConnections = <T>(
  input: T,
  source: ReceiptPreview | TransactionPreview,
): T & Pick<Explorer.ActivityConnection, 'sender' | 'receiver'> => {
  return {
    ...input,
    sender: source.signerId,
    receiver: source.receiverId,
  };
};

const getDeposit = (actions: Explorer.Action[]) =>
  actions
    .map((action) =>
      'deposit' in action.args ? BigInt(action.args.deposit) : 0n,
    )
    .reduce((accumulator, deposit) => accumulator + deposit, 0n);

const getTransactionFee = (
  transactionOutcome: RPC.ExecutionOutcomeWithIdView,
  receiptsOutcome: RPC.ExecutionOutcomeWithIdView[],
) =>
  receiptsOutcome
    .map((receipt) => BigInt(receipt.outcome.tokens_burnt))
    .reduce(
      (tokenBurnt, currentFee) => tokenBurnt + currentFee,
      BigInt(transactionOutcome.outcome.tokens_burnt),
    );

type ParsedReceipt = Omit<Explorer.NestedReceiptWithOutcome, 'outcome'> & {
  outcome: Omit<
    Explorer.NestedReceiptWithOutcome['outcome'],
    'nestedReceipts'
  > & {
    receiptIds: string[];
  };
};

const parseReceipt = (
  receipt: RPC.ReceiptView | undefined,
  outcome: RPC.ExecutionOutcomeWithIdView,
  transaction: RPC.SignedTransactionView,
): Omit<ParsedReceipt, 'outcome'> => {
  if (!receipt) {
    return {
      id: outcome.id,
      predecessorId: transaction.signer_id,
      receiverId: transaction.receiver_id,
      actions: transaction.actions.map(mapRpcActionToAction),
    };
  }
  return {
    id: receipt.receipt_id,
    predecessorId: receipt.predecessor_id,
    receiverId: receipt.receiver_id,
    actions:
      'Action' in receipt.receipt
        ? receipt.receipt.Action.actions.map(mapRpcActionToAction)
        : [],
  };
};

type ParsedBlock = {
  hash: string;
  height: number;
  timestamp: number;
};

const parseOutcome = (
  outcome: RPC.ExecutionOutcomeWithIdView,
  blocksMap: Map<string, ParsedBlock>,
): ParsedReceipt['outcome'] => {
  return {
    tokensBurnt: outcome.outcome.tokens_burnt,
    gasBurnt: outcome.outcome.gas_burnt,
    status: mapRpcReceiptStatus(outcome.outcome.status),
    logs: outcome.outcome.logs,
    receiptIds: outcome.outcome.receipt_ids,
    block: blocksMap.get(outcome.block_hash)!,
  };
};

const collectNestedReceiptWithOutcome = (
  idOrHash: string,
  parsedMap: Map<string, ParsedReceipt>,
): Explorer.NestedReceiptWithOutcome => {
  const parsedElement = parsedMap.get(idOrHash)!;
  const { receiptIds, ...restOutcome } = parsedElement.outcome;
  // TODO instead of filtering receipts out, we should be getting the details from RPC in the EXPERIMENTAL_tx_status call
  // but RPC stopped providing refund receipt's details so we needed to put this fix in place.
  // Right now, filtering out the receipts is easier than trying to return just the id of the receipt if the details are not found.
  const filteredReceipts = receiptIds.filter((id) => parsedMap.has(id));
  return {
    ...parsedElement,
    outcome: {
      ...restOutcome,
      nestedReceipts: filteredReceipts.map((id) =>
        collectNestedReceiptWithOutcome(id, parsedMap),
      ),
    },
  };
};

@Injectable()
export class ExplorerService {
  private indexerDatabase: Record<Net, Kysely<Indexer.ModelTypeMap>>;
  private indexerActivityDatabase: Partial<
    Record<Net, Kysely<IndexerActivity.ModelTypeMap>>
  >;
  constructor(
    private nearRpc: NearRpcService,
    private config: ConfigService<AppConfig>,
  ) {
    const indexerDatabaseConfig = this.config.get('indexerDatabase', {
      infer: true,
    })!;
    const indexerActivityDatabaseConfig = this.config.get(
      'indexerActivityDatabase',
      { infer: true },
    )!;
    this.indexerDatabase = {
      MAINNET: getKysely<Indexer.ModelTypeMap>(indexerDatabaseConfig.MAINNET),
      TESTNET: getKysely<Indexer.ModelTypeMap>(indexerDatabaseConfig.TESTNET),
    };
    this.indexerActivityDatabase = {
      MAINNET: indexerActivityDatabaseConfig.MAINNET
        ? getKysely<Indexer.ModelTypeMap>(indexerActivityDatabaseConfig.MAINNET)
        : undefined,
      TESTNET: indexerActivityDatabaseConfig.TESTNET
        ? getKysely<Indexer.ModelTypeMap>(indexerActivityDatabaseConfig.TESTNET)
        : undefined,
    };
  }

  getAccountActivityAction(
    change: Awaited<ReturnType<typeof queryBalanceChanges>>[number],
    receiptsMapping: Map<string, ReceiptPreview>,
    transactionsMapping: Map<string, TransactionPreview>,
    blockHeightsMapping: Map<string, { hash: string }>,
    receiptRelations: Map<
      string,
      { parentReceiptId: string | null; childrenReceiptIds: string[] }
    >,
  ): Explorer.ActivityActionItemAction | null {
    switch (change.cause) {
      case 'RECEIPT': {
        const connectedReceipt = receiptsMapping.get(change.receiptId!)!;
        const relation = receiptRelations.get(change.receiptId!)!;
        const parentReceipt = relation.parentReceiptId
          ? receiptsMapping.get(relation.parentReceiptId)!
          : undefined;
        const childrenReceipts = relation.childrenReceiptIds.map(
          (childrenReceiptId) => receiptsMapping.get(childrenReceiptId)!,
        );
        return withActivityConnection(
          {
            ...getActivityAction(connectedReceipt.actions),
            parentAction:
              // Refund
              parentReceipt && parentReceipt.signerId !== 'system'
                ? withConnections(
                    withActivityConnection(
                      getActivityAction(parentReceipt.actions),
                      parentReceipt,
                    ),
                    parentReceipt,
                  )
                : undefined,
            childrenActions: childrenReceipts
              // Refund
              .filter((receipt) => receipt.signerId !== 'system')
              .map((receipt) =>
                withConnections(
                  withActivityConnection(
                    getActivityAction(receipt.actions),
                    receipt,
                  ),
                  receipt,
                ),
              ),
          },
          connectedReceipt,
        );
      }
      case 'TRANSACTION': {
        const connectedTransaction = transactionsMapping.get(
          change.transactionHash!,
        )!;
        // filter out inbound successful transactions
        if (
          connectedTransaction.status === 'success' &&
          change.direction === 'INBOUND'
        ) {
          return null;
        }
        return withActivityConnection(
          {
            ...getActivityAction(connectedTransaction.actions),
            childrenActions: [],
          },
          connectedTransaction,
        );
      }
      case 'VALIDATORS_REWARD':
        const connectedBlock = blockHeightsMapping.get(change.blockTimestamp!)!;
        return withActivityConnection({
          kind: 'validatorReward',
          blockHash: connectedBlock.hash,
        });
    }
    throw new Error(`Unknown cause: ${change.cause}`);
  }

  async getBlockHeightsByTimestamps(net: Net, blockTimestamps: string[]) {
    if (blockTimestamps.length === 0) {
      return new Map();
    }
    const indexerDatabase = this.indexerDatabase[net];
    const blocks = await indexerDatabase
      .selectFrom('blocks')
      .select(['block_timestamp as timestamp', 'block_hash as hash'])
      .where('block_timestamp', 'in', blockTimestamps)
      .execute();
    return blocks.reduce(
      (acc, block) => acc.set(block.timestamp, { hash: block.hash }),
      new Map<string, { hash: string }>(),
    );
  }

  async queryReceiptsByIds(net: Net, ids: string[]) {
    const indexerDatabase = this.indexerDatabase[net];
    return queryReceiptsByIds(indexerDatabase, ids);
  }

  async getReceiptsByIds(
    net: Net,
    ids: string[],
  ): Promise<{
    receiptsMapping: Map<string, ReceiptPreview>;
    relations: Map<
      string,
      { parentReceiptId: string | null; childrenReceiptIds: string[] }
    >;
  }> {
    if (ids.length === 0) {
      return {
        receiptsMapping: new Map(),
        relations: new Map(),
      };
    }
    const indexerDatabase = this.indexerDatabase[net];
    const receiptsMapping = this.getReceiptMapping(
      await this.queryReceiptsByIds(net, ids),
    );
    const relatedResult = await indexerDatabase
      .selectFrom('execution_outcome_receipts')
      .select([
        'executed_receipt_id as executedReceiptId',
        'produced_receipt_id as producedReceiptId',
      ])
      .where('executed_receipt_id', 'in', ids)
      .orWhere('produced_receipt_id', 'in', ids)
      .execute();
    const relations = ids.reduce((acc, id) => {
      const relatedIds: {
        parentReceiptId: string | null;
        childrenReceiptIds: string[];
      } = {
        parentReceiptId: null,
        childrenReceiptIds: [],
      };
      const parentRow = relatedResult.find(
        (row) => row.producedReceiptId === id,
      );
      if (parentRow) {
        relatedIds.parentReceiptId = parentRow.executedReceiptId;
      }
      const childrenRows = relatedResult.filter(
        (row) => row.executedReceiptId === id,
      );
      if (childrenRows.length !== 0) {
        relatedIds.childrenReceiptIds = childrenRows.map(
          (row) => row.producedReceiptId,
        );
      }
      return acc.set(id, relatedIds);
    }, new Map<string, { parentReceiptId: string | null; childrenReceiptIds: string[] }>());
    const prevReceiptIds = [...receiptsMapping.keys()];
    const lookupIds = [...relations.values()].reduce<Set<string>>(
      (acc, relation) => {
        if (
          relation.parentReceiptId &&
          !prevReceiptIds.includes(relation.parentReceiptId)
        ) {
          acc.add(relation.parentReceiptId);
        }
        const filteredChildrenIds = relation.childrenReceiptIds.filter(
          (id) => !prevReceiptIds.includes(id),
        );
        filteredChildrenIds.forEach((id) => acc.add(id));
        return acc;
      },
      new Set(),
    );
    return {
      receiptsMapping: this.getReceiptMapping(
        await this.queryReceiptsByIds(net, [...lookupIds]),
        receiptsMapping,
      ),
      relations,
    };
  }

  getReceiptMapping(
    receiptRows: Awaited<ReturnType<typeof queryReceiptsByIds>>,
    initialMapping: Map<string, ReceiptPreview> = new Map(),
  ) {
    return receiptRows.reduce((mapping, receipt) => {
      const action = mapDatabaseActionToAction({
        hash: receipt.originatedFromTransactionHash,
        kind: receipt.kind,
        args: receipt.args,
      } as DatabaseAction);
      const existingReceipt = mapping.get(receipt.id);
      if (!existingReceipt) {
        return mapping.set(receipt.id, {
          type: 'receipt',
          signerId: receipt.predecessorId,
          receiverId: receipt.receiverId,
          receiptId: receipt.id,
          originatedFromTransactionHash: receipt.originatedFromTransactionHash,
          actions: [action],
        });
      }
      return mapping.set(receipt.id, {
        ...existingReceipt,
        actions: [...existingReceipt.actions, action],
      });
    }, new Map<string, ReceiptPreview>(initialMapping));
  }

  async getTransactionsByHashes(
    net: Net,
    hashes: string[],
  ): Promise<Map<string, TransactionPreview>> {
    if (hashes.length === 0) {
      return new Map();
    }
    const indexerDatabase = this.indexerDatabase[net];
    const transactionRows = await indexerDatabase
      .selectFrom('transactions')
      .select([
        'transaction_hash as hash',
        'signer_account_id as signerId',
        'receiver_account_id as receiverId',
        'included_in_block_hash as blockHash',
        (eb) => div(eb, 'block_timestamp', 1000 * 1000, 'blockTimestamp'),
        'index_in_chunk as transactionIndex',
        'status',
      ])
      .where('transaction_hash', 'in', hashes)
      .execute();
    if (transactionRows.length === 0) {
      return new Map();
    }
    const transactionsActions = await indexerDatabase
      .selectFrom('transaction_actions')
      .select(['transaction_hash as hash', 'action_kind as kind', 'args'])
      .where(
        'transaction_hash',
        'in',
        transactionRows.map(({ hash }) => hash),
      )
      .orderBy('transaction_hash')
      .execute();
    const transactionsActionsList = transactionsActions.reduce(
      (mapping, action) =>
        mapping.set(action.hash, [
          ...(mapping.get(action.hash) || []),
          mapDatabaseActionToAction(action as DatabaseAction),
        ]),
      new Map<string, Explorer.Action[]>(),
    );
    return transactionRows.reduce((acc, transaction) => {
      acc.set(transaction.hash, {
        type: 'transaction',
        hash: transaction.hash,
        signerId: transaction.signerId,
        receiverId: transaction.receiverId,
        status: mapDatabaseTransactionStatus(transaction.status),
        actions: transactionsActionsList.get(transaction.hash) ?? [],
      });
      return acc;
    }, new Map<string, TransactionPreview>());
  }

  queryBalanceChanges(
    net: Net,
    accountId: string,
    limit: number,
    cursor?: AccountActivityCursor,
  ) {
    const activityDatabase = this.indexerActivityDatabase[net];
    if (!activityDatabase) {
      return [];
    }
    return queryBalanceChanges(activityDatabase, accountId, limit, cursor);
  }

  async fetchActivity(
    net: Net,
    accountId: string,
    limit: number,
    cursor?: AccountActivityCursor,
  ): Promise<Explorer.AccountActivity> {
    try {
      const changes = await this.queryBalanceChanges(
        net,
        accountId,
        limit,
        cursor,
      );

      const idsToFetch = getIdsFromAccountChanges(changes);
      const [
        { receiptsMapping, relations: receiptRelations },
        transactionsMapping,
        blocksMapping,
      ] = await Promise.all([
        this.getReceiptsByIds(net, idsToFetch.receiptIds),
        this.getTransactionsByHashes(net, idsToFetch.transactionHashes),
        this.getBlockHeightsByTimestamps(net, idsToFetch.blocksTimestamps),
      ]);
      const lastChange = changes.at(-1);
      return {
        items: changes
          .map((change) => {
            const action = this.getAccountActivityAction(
              change,
              receiptsMapping,
              transactionsMapping,
              blocksMapping,
              receiptRelations,
            );
            if (!action) {
              return null;
            }
            return {
              timestamp: nanosecondsToMilliseconds(
                BigInt(change.blockTimestamp),
              ),
              involvedAccountId: change.involvedAccountId!,
              direction:
                change.direction === 'INBOUND'
                  ? ('inbound' as const)
                  : ('outbound' as const),
              deltaAmount: change.deltaNonStakedAmount,
              action,
            };
          })
          .filter(notNullGuard),
        cursor: lastChange
          ? {
              blockTimestamp: lastChange.blockTimestamp,
              shardId: lastChange.shardId,
              indexInChunk: lastChange.indexInChunk,
            }
          : undefined,
      };
    } catch (e: any) {
      throw new VError(e, 'Failed to fetch activity');
    }
  }

  async fetchTransaction(
    net: Net,
    hash: string,
  ): Promise<Explorer.Transaction | null> {
    try {
      const indexerDatabase = this.indexerDatabase[net];
      const databaseTransaction = await indexerDatabase
        .selectFrom('transactions')
        .select([
          'signer_account_id as signerId',
          (eb) => div(eb, 'block_timestamp', 1000 * 1000, 'timestamp'),
        ])
        .where('transaction_hash', '=', hash)
        .executeTakeFirst();
      if (!databaseTransaction) {
        return null;
      }
      const rpcTransaction = await this.nearRpc.transactionStatus(
        net,
        hash,
        databaseTransaction.signerId,
      );
      const blocks = await indexerDatabase
        .selectFrom('blocks')
        .select([
          'block_height as height',
          'block_hash as hash',
          (eb) => div(eb, 'block_timestamp', 1000 * 1000, 'timestamp'),
        ])
        .where(
          'block_hash',
          'in',
          rpcTransaction.receipts_outcome.map((outcome) => outcome.block_hash),
        )
        .execute();
      const blocksMap = blocks.reduce(
        (map, row) =>
          map.set(row.hash, {
            hash: row.hash,
            height: parseInt(row.height),
            timestamp: parseInt(row.timestamp),
          }),
        new Map<string, ParsedBlock>(),
      );

      const transactionFee = getTransactionFee(
        rpcTransaction.transaction_outcome,
        rpcTransaction.receipts_outcome,
      );

      const txActions =
        rpcTransaction.transaction.actions.map(mapRpcActionToAction);
      const transactionAmount = getDeposit(txActions);

      const receiptsMap = rpcTransaction.receipts_outcome.reduce(
        (mapping, receiptOutcome) => {
          const receipt = parseReceipt(
            rpcTransaction.receipts.find(
              (receipt) => receipt.receipt_id === receiptOutcome.id,
            ),
            receiptOutcome,
            rpcTransaction.transaction,
          );
          return mapping.set(receiptOutcome.id, {
            ...receipt,
            outcome: parseOutcome(receiptOutcome, blocksMap),
          });
        },
        new Map<string, ParsedReceipt>(),
      );

      return {
        hash,
        timestamp: parseInt(databaseTransaction.timestamp),
        signerId: rpcTransaction.transaction.signer_id,
        receiverId: rpcTransaction.transaction.receiver_id,
        fee: transactionFee.toString(),
        amount: transactionAmount.toString(),
        status: mapRpcTransactionStatus(rpcTransaction.status),
        receipt: collectNestedReceiptWithOutcome(
          rpcTransaction.transaction_outcome.outcome.receipt_ids[0],
          receiptsMap,
        ),
      };
    } catch (e: any) {
      throw new VError(e, 'Failed to fetch transaction');
    }
  }

  async fetchBalanceChanges(
    net: Net,
    receiptId: string,
    accountIds: string[],
  ): Promise<(string | null)[]> {
    try {
      const activityDatabase = this.indexerActivityDatabase[net];
      if (!activityDatabase) {
        return accountIds.map(() => null);
      }
      const balanceChanges = await activityDatabase
        .selectFrom('balance_changes')
        .select([
          'absolute_nonstaked_amount as absoluteNonStakedAmount',
          'affected_account_id as accountId',
        ])
        .where('affected_account_id', 'in', accountIds)
        .where('receipt_id', '=', receiptId)
        .orderBy('index_in_chunk', 'desc')
        .execute();
      if (!balanceChanges) {
        return accountIds.map(() => null);
      }
      return accountIds.map(
        (accountId) =>
          balanceChanges.find((change) => change.accountId === accountId)
            ?.absoluteNonStakedAmount ?? null,
      );
    } catch (e: any) {
      throw new VError(e, 'Failed to fetch transaction');
    }
  }
}
