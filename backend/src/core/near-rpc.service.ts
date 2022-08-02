import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { VError } from 'verror';
import { Net } from '.prisma/client';
import { AppConfig } from '../config/validate';

type AccountStatus = 'EXISTS' | 'NOT_FOUND';

@Injectable()
export class NearRpcService {
  private fetchers: Record<Net, AxiosInstance>;

  constructor(private config: ConfigService<AppConfig>) {
    this.fetchers = {
      MAINNET: axios.create({
        baseURL: this.config.get('nearRpc.MAINNET.url', { infer: true }),
      }),
      TESTNET: axios.create({
        baseURL: this.config.get('nearRpc.TESTNET.url', { infer: true }),
      }),
    };
  }

  // Checks if the account exists on the Near blockchain.
  async checkAccountExists(
    net: Net,
    account_id: string,
  ): Promise<AccountStatus> {
    const res = await this.fetchers[net].post('/', {
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
}
