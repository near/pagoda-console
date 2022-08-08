import { Injectable } from '@nestjs/common';
import { VError } from 'verror';
import { ConfigService } from '@nestjs/config';

import { BN } from 'bn.js';
// const models = require('./models');

interface Transaction {
  hash: string;
  signerId: string;
  receiverId: string;
  blockHash: string;
  blockTimestamp: string;
  transactionIndex: number;
  actions?: any[];
}

const INDEXER_COMPATIBILITY_TRANSACTION_ACTION_KINDS = new Map([
  ['ADD_KEY', 'AddKey'],
  ['CREATE_ACCOUNT', 'CreateAccount'],
  ['DELETE_ACCOUNT', 'DeleteAccount'],
  ['DELETE_KEY', 'DeleteKey'],
  ['DEPLOY_CONTRACT', 'DeployContract'],
  ['FUNCTION_CALL', 'FunctionCall'],
  ['STAKE', 'Stake'],
  ['TRANSFER', 'Transfer'],
]);

const DS_INDEXER_MAINNET = 'DS_INDEXER_MAINNET';
const DS_INDEXER_TESTNET = 'DS_INDEXER_TESTNET';

// EXAMPLE
// async function main() {
//     let paginationIndexer = {
//         endTimestamp: Date.now(),
//         transactionIndex: 0,
//     };
//     let result = await queryAccountTransactionsList('serhii.testnet', 1000, paginationIndexer, DS_INDEXER_TESTNET);
//     console.log(result);
// }

import { Sequelize, QueryTypes } from 'sequelize';
import { Net } from '../../generated/prisma/core';
import { AppConfig } from '../config/validate';

@Injectable()
export class IndexerService {
  // number of recent transactions to return
  private recentTransactionsCount;
  // indexer db connections formed by Sequelize
  private db: {
    sequelizeIndexerBackendMainnetReadOnly: Sequelize;
    sequelizeIndexerBackendTestnetReadOnly: Sequelize;
  };
  constructor(private config: ConfigService<AppConfig>) {
    this.recentTransactionsCount = this.config.get('recentTransactionsCount', {
      infer: true,
    });
    const indexerDatabaseConfig = this.config.get('indexerDatabase');
    this.db = {
      sequelizeIndexerBackendMainnetReadOnly: new Sequelize(
        indexerDatabaseConfig.MAINNET.database,
        indexerDatabaseConfig.MAINNET.user,
        indexerDatabaseConfig.MAINNET.password,
        {
          host: indexerDatabaseConfig.MAINNET.host,
          dialect: 'postgres',
          logging: this.config.get('log.indexer', { infer: true })
            ? console.log
            : false,
        },
      ),
      sequelizeIndexerBackendTestnetReadOnly: new Sequelize(
        indexerDatabaseConfig.TESTNET.database,
        indexerDatabaseConfig.TESTNET.user,
        indexerDatabaseConfig.TESTNET.password,
        {
          host: indexerDatabaseConfig.TESTNET.host,
          dialect: 'postgres',
          logging: this.config.get('log.indexer', { infer: true })
            ? console.log
            : false,
        },
      ),
    };
  }

  async queryAccountTransactionsList(
    accountId,
    limit = 15,
    paginationIndexer,
    dataSource,
  ) {
    return await this.query(
      [
        `SELECT transactions.transaction_hash AS hash,
                transactions.signer_account_id AS signer_id,
                transactions.receiver_account_id AS receiver_id,
                transactions.included_in_block_hash AS block_hash,
                DIV(transactions.block_timestamp, 1000 * 1000) AS block_timestamp,
                transactions.index_in_chunk AS transaction_index
        FROM transactions
        ${
          paginationIndexer
            ? `WHERE (transaction_hash IN
                (SELECT originated_from_transaction_hash
                FROM receipts
                WHERE receipts.predecessor_account_id = :account_id
                  OR receipts.receiver_account_id = :account_id))
        AND (transactions.block_timestamp < :end_timestamp
              OR (transactions.block_timestamp = :end_timestamp
                  AND transactions.index_in_chunk < :transaction_index))`
            : `WHERE transaction_hash IN
              (SELECT originated_from_transaction_hash
              FROM receipts
              WHERE receipts.predecessor_account_id = :account_id
                OR receipts.receiver_account_id = :account_id)`
        }
        ORDER BY transactions.block_timestamp DESC,
                transactions.index_in_chunk DESC
        LIMIT :limit`,
        {
          account_id: accountId,
          end_timestamp: paginationIndexer
            ? new BN(paginationIndexer.endTimestamp).muln(10 ** 6).toString()
            : undefined,
          transaction_index: paginationIndexer?.transactionIndex,
          limit,
        },
      ],
      { dataSource },
    );
  }

  async queryTransactionsActionsList(transactionHashes, net: Net) {
    return await this.queryRows(
      [
        `SELECT
          transaction_hash,
          action_kind AS kind,
          args
         FROM transaction_actions
         WHERE transaction_hash IN (:transaction_hashes)
         ORDER BY transaction_hash`,
        { transaction_hashes: transactionHashes },
      ],
      {
        dataSource: net === 'MAINNET' ? DS_INDEXER_MAINNET : DS_INDEXER_TESTNET,
      },
    );
  }

  async query([query, replacements], { dataSource }) {
    const sequelize = this.getSequelize(dataSource);
    return await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
  }

  async queryRows(args, options) {
    return await this.query(args, options || {});
  }

  getSequelize(dataSource) {
    switch (dataSource) {
      case DS_INDEXER_MAINNET:
        return this.db.sequelizeIndexerBackendMainnetReadOnly;
      case DS_INDEXER_TESTNET:
        return this.db.sequelizeIndexerBackendTestnetReadOnly;
      default:
        throw new VError('getSequelize() has no default dataSource');
    }
  }

  // helper function to init transactions list
  // as we use the same structure but different queries for account, block, txInfo and list
  async createTransactionsList(transactionsArray, net: Net) {
    const transactionsHashes = transactionsArray.map(({ hash }) => hash);
    const transactionsActionsList = await this.getTransactionsActionsList(
      transactionsHashes,
      net,
    );

    return transactionsArray.map((transaction) => ({
      hash: transaction.hash,
      signerId: transaction.signer_id,
      receiverId: transaction.receiver_id,
      blockHash: transaction.block_hash,
      blockTimestamp: parseInt(transaction.block_timestamp),
      transactionIndex: transaction.transaction_index,
      actions: transactionsActionsList.get(transaction.hash),
    }));
  }

  async getTransactionsActionsList(transactionsHashes, net: Net) {
    const transactionsActionsByHash = new Map();
    const transactionsActions = await this.queryTransactionsActionsList(
      transactionsHashes,
      net,
    );
    if (transactionsActions.length === 0) {
      return transactionsActionsByHash;
    }
    transactionsActions.forEach((action: any) => {
      const txAction =
        transactionsActionsByHash.get(action.transaction_hash) || [];
      return transactionsActionsByHash.set(action.transaction_hash, [
        ...txAction,
        {
          kind: INDEXER_COMPATIBILITY_TRANSACTION_ACTION_KINDS.get(action.kind),
          args:
            typeof action.args === 'string'
              ? JSON.parse(action.args)
              : action.args,
        },
      ]);
    });
    return transactionsActionsByHash;
  }

  async getAccountTransactionsList(
    accountId,
    limit,
    paginationIndexer,
    dataSource,
    net: Net,
  ) {
    const accountTxList = await this.queryAccountTransactionsList(
      accountId,
      limit,
      paginationIndexer,
      dataSource,
    );
    if (accountTxList.length === 0) {
      return undefined;
    }
    return await this.createTransactionsList(accountTxList, net);
  }

  async fetchRecentTransactions(accounts: string[], net: Net) {
    const promises = [];

    for (const account of accounts) {
      const paginationIndexer = {
        endTimestamp: Date.now(),
        transactionIndex: 0,
      };
      promises.push(
        this.getAccountTransactionsList(
          account,
          this.recentTransactionsCount, // TODO
          paginationIndexer,
          net === 'MAINNET' ? DS_INDEXER_MAINNET : DS_INDEXER_TESTNET,
          net,
        ),
      );
      // console.log(res);
    }
    const results = await Promise.allSettled(promises);
    // console.log(results);
    let mergedTransactions = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value?.length) {
        const resultsWithSource = result.value.map((t) => {
          return {
            ...t,
            sourceContract: accounts[i],
          };
        });
        mergedTransactions = mergedTransactions.concat(resultsWithSource);
      }
    }

    // TODO handle more elegantly in future, but just sort and slice for now
    /*
    if (!mergedTransactions.length) {
      // TODO handle no transactions
    } else if (mergedTransactions.length <= this.recentTransactionsCount) {
      return mergedTransactions.sort(compareTransactions);
    } else {
      return mergedTransactions.sort(compareTransactions);
    }
    */
    return mergedTransactions
      .sort(compareTransactions)
      .slice(0, this.recentTransactionsCount);
  }
}

function compareTransactions(a: Transaction, b: Transaction) {
  return new BN(b.blockTimestamp).cmp(new BN(a.blockTimestamp));
}
