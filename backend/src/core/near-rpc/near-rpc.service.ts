import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { VError } from 'verror';
import { Net } from '../../../generated/prisma/core';
import { AppConfig } from '../../config/validate';
import * as RPC from './types';

type AccountStatus = 'EXISTS' | 'NOT_FOUND';

@Injectable()
export class NearRpcService {
  private fetchers: Record<'rpc' | 'archivalRpc', Record<Net, AxiosInstance>>;

  constructor(private config: ConfigService<AppConfig>) {
    this.fetchers = {
      rpc: {
        MAINNET: axios.create({
          baseURL: this.config.get('nearRpc.MAINNET.url', { infer: true }),
        }),
        TESTNET: axios.create({
          baseURL: this.config.get('nearRpc.TESTNET.url', { infer: true }),
        }),
      },
      archivalRpc: {
        MAINNET: axios.create({
          baseURL: this.config.get('nearArchivalRpc.MAINNET.url', {
            infer: true,
          }),
        }),
        TESTNET: axios.create({
          baseURL: this.config.get('nearArchivalRpc.TESTNET.url', {
            infer: true,
          }),
        }),
      },
    };
  }

  // Checks if the account exists on the Near blockchain.
  async checkAccountExists(
    net: Net,
    account_id: string,
  ): Promise<AccountStatus> {
    const res = await this.fetchers.rpc[net].post('/', {
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'query',
      params: {
        request_type: 'view_account',
        finality: 'final',
        account_id,
      },
    });

    if (res.data.result) {
      return 'EXISTS';
    }

    if (!res.data.error || !res.data.error.cause) {
      throw new VError('Failed to determine if account exists');
    }

    // See valid responses here: https://docs.near.org/api/rpc/contracts
    if (res.data.error.cause.name === 'UNKNOWN_ACCOUNT') {
      return 'NOT_FOUND';
    }

    throw new VError('Failed to determine if account exists', {
      error: res.data.error,
    });
  }

  async transactionStatus(
    net: Net,
    hash: string,
    signerId: string,
  ): Promise<RPC.FinalExecutionOutcomeWithReceiptView> {
    const res = await this.fetchers.archivalRpc[net].post('/', {
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'EXPERIMENTAL_tx_status',
      params: [hash, signerId],
    });

    if (res.data.result) {
      return res.data.result;
    }

    throw new VError('Failed to fetch transaction status', {
      error: res.data.error,
    });
  }
}
