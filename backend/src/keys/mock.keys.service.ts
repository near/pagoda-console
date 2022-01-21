import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Net } from '@prisma/client';
import { VError } from 'verror';

const mockTokens: Record<Net, string> = {
  MAINNET: 'mainnet0-becb-4116-aeea-515781f9699f',
  TESTNET: 'testnet0-becb-4116-aeea-515781f9699f',
};
const mockInvalidTokens: Record<Net, string> = {
  MAINNET: 'mainnet0-inval-4116-aeea-515781f9699f',
  TESTNET: 'testnet0-inval-4116-aeea-515781f9699f',
};

@Injectable()
export class MockKeysService {
  constructor(private config: ConfigService) {}

  async createProject(keyId: string, net: Net) {
    if (this.config.get('MOCK_KEY_SERVICE_WITH_ERRORS') === 'true') {
      console.log('Mocking createProject with errors');
      throw new VError('Failed while sending project creation request');
    }
    return {
      project_ref: keyId,
      invalid: false,
      invalidated_at: null,
      created_at: new Date().valueOf(),
      quota: 100,
    };
  }

  async generate(keyId: string, net: Net) {
    return {
      project_ref: keyId,
      invalid: false,
      created_at: new Date().valueOf(),
      invalidated_at: null,
      token: mockTokens[net],
      quota: 23,
    };
  }

  async invalidate(keyId: string, net: Net) {
    return;
  }

  async rotate(keyId: string, net: Net) {
    if (this.config.get('MOCK_KEY_SERVICE_WITH_ERRORS') === 'true') {
      console.log('Mocking rotate with errors');
      throw new VError('Failed while generating new API key');
    }
    return this.generate(keyId, net);
  }

  async fetch(keyId: string, net: Net): Promise<string> {
    return mockTokens[net];
  }

  async fetchAll(keyId: string, net: Net): Promise<Array<string>> {
    return [mockTokens[net], mockInvalidTokens[net]];
  }
}
