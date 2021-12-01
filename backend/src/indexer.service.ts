import { Injectable } from '@nestjs/common';
import VError from 'verror';
import { ConfigService } from '@nestjs/config';

import { BN } from 'bn.js';
// const models = require('./models');

interface Transaction {
  hash: string;
  signer_id: string;
  receiver_id: string;
  block_hash: string;
  block_timestamp: string;
  transaction_index: number;
}

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

import { Sequelize, Dialect, QueryTypes } from 'sequelize';
import { Net } from '.prisma/client';

const dbConfig = {
  indexerDatabaseTestnet: {
    dialect: 'postgres' as Dialect,
    host: '35.184.214.98',
    database: 'testnet_explorer',
    username: 'public_readonly',
    password: 'nearprotocol',
  },
  indexerDatabaseMainnet: {
    dialect: 'postgres' as Dialect,
    host: '104.199.89.51',
    database: 'mainnet_explorer',
    username: 'public_readonly',
    password: 'nearprotocol',
  },
};

const db = {
  sequelizeIndexerBackendMainnetReadOnly: new Sequelize(
    dbConfig.indexerDatabaseMainnet.database,
    dbConfig.indexerDatabaseMainnet.username,
    dbConfig.indexerDatabaseMainnet.password,
    {
      host: dbConfig.indexerDatabaseMainnet.host,
      dialect: dbConfig.indexerDatabaseMainnet.dialect,
    },
  ),
  sequelizeIndexerBackendTestnetReadOnly: new Sequelize(
    dbConfig.indexerDatabaseTestnet.database,
    dbConfig.indexerDatabaseTestnet.username,
    dbConfig.indexerDatabaseTestnet.password,
    {
      host: dbConfig.indexerDatabaseTestnet.host,
      dialect: dbConfig.indexerDatabaseTestnet.dialect,
    },
  ),
  Sequelize,
};

@Injectable()
export class IndexerService {
  private recentTransactionsCount;
  constructor(private config: ConfigService) {
    this.recentTransactionsCount = parseInt(
      this.config.get('RECENT_TRANSACTIONS_COUNT'),
    );
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

  async query([query, replacements], { dataSource }) {
    const sequelize = this.getSequelize(dataSource);
    return await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
  }

  getSequelize(dataSource) {
    switch (dataSource) {
      case DS_INDEXER_MAINNET:
        return db.sequelizeIndexerBackendMainnetReadOnly;
      case DS_INDEXER_TESTNET:
        return db.sequelizeIndexerBackendTestnetReadOnly;
      default:
        throw new VError('getSequelize() has no default dataSource');
    }
  }

  async test() {
    const paginationIndexer = {
      endTimestamp: Date.now(),
      transactionIndex: 0,
    };
    const res = await this.queryAccountTransactionsList(
      'serhii.testnet',
      2,
      paginationIndexer,
      DS_INDEXER_TESTNET,
    );
    console.log(res);
  }

  async fetchRecentTransactions(accounts: string[], net: Net) {
    const promises = [];

    for (const account of accounts) {
      const paginationIndexer = {
        endTimestamp: Date.now(),
        transactionIndex: 0,
      };
      promises.push(
        this.queryAccountTransactionsList(
          account,
          this.recentTransactionsCount,
          paginationIndexer,
          net === 'MAINNET' ? DS_INDEXER_MAINNET : DS_INDEXER_TESTNET,
        ),
      );
      // console.log(res);
    }
    const results = await Promise.allSettled(promises);
    console.log(results);
    let mergedTransactions = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        mergedTransactions = mergedTransactions.concat(result.value);
      }
    }

    if (!mergedTransactions.length) {
      // TODO handle no transactions
    } else if (mergedTransactions.length <= this.recentTransactionsCount) {
      return mergedTransactions.sort(compareTransactions);
    } else {
      // TODO
      //
      // TEMP SORT ALL
      return mergedTransactions.sort(compareTransactions);
    }
  }
}

function compareTransactions(a: Transaction, b: Transaction) {
  return new BN(b.block_timestamp).cmp(new BN(a.block_timestamp));
}
