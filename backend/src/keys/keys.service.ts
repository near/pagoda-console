import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { VError } from 'verror';
import { Net } from '.prisma/client';

interface Key {
  project_ref: string;
  invalid: boolean;
  created_at: string;
  invalidated_at: string;
  token: string;
  quota: number;
}

@Injectable()
export class KeysService {
  private fetchers: Record<Net, AxiosInstance>;
  private quotas: Record<Net, number>;

  constructor(private config: ConfigService) {
    this.fetchers = {
      MAINNET: axios.create({
        baseURL: this.config.get('KEY_MANAGEMENT_URL_MAIN'),
        headers: {
          Authorization: this.config.get('KEY_MANAGEMENT_CREDENTIALS_MAIN'),
        },
      }),
      TESTNET: axios.create({
        baseURL: this.config.get('KEY_MANAGEMENT_URL_TEST'),
        headers: {
          Authorization: this.config.get('KEY_MANAGEMENT_CREDENTIALS_TEST'),
        },
      }),
    };

    this.quotas = {
      MAINNET: parseInt(this.config.get('KEY_MANAGEMENT_QUOTA_MAIN')),
      TESTNET: parseInt(this.config.get('KEY_MANAGEMENT_QUOTA_TEST')),
    };
  }

  async createProject(keyId: string, net: Net) {
    try {
      await this.fetchers[net].post('/projects', {
        project_ref: keyId,
        quota: this.quotas[net],
      });
    } catch (e) {
      throw new VError(e, 'Failed while sending project creation request');
    }

    try {
      return await this.generate(keyId, net);
    } catch (e) {
      throw new VError(e, 'Failed while sending token generation request');
    }
  }

  async generate(keyId: string, net: Net) {
    const res = await this.fetchers[net].post('/token/generate', {
      project_ref: keyId,
      quota: this.quotas[net],
    });
    return res.data;
  }

  async invalidate(keyId: string, net: Net) {
    let currentToken;
    try {
      currentToken = await this.fetch(keyId, net);
    } catch (e) {
      // If there are no valid keys with the given keyId, then it was probably already invalidated.
      // Attempting to invalidate again will result in a 400 error.
      if (VError.info(e)?.code === 'NO_VALID_KEYS') {
        return;
      }
      throw new VError(e, 'Failed while fetching current API key');
    }
    try {
      return await this.fetchers[net].post('/token/invalidate', {
        token: currentToken,
      });
    } catch (e) {
      throw new VError(e, 'Failed on request to invalidate current API key');
    }
  }

  async rotate(keyId: string, net: Net) {
    try {
      await this.invalidate(keyId, net);
    } catch (e) {
      throw new VError(
        e,
        'Failed while invalidating current API Key for rotation',
      );
    }
    try {
      return await this.generate(keyId, net);
    } catch (e) {
      throw new VError(e, 'Failed while generating new API key');
    }
  }

  async fetch(keyId: string, net: Net): Promise<string> {
    const res = await this.fetchers[net].get(`/projects/${keyId}/tokens`);
    if (!Array.isArray(res.data)) {
      throw new VError('Did not receive key list');
    }
    const keyData = res.data as Key[];
    let validKey;
    try {
      validKey = keyData.find((key) => !key.invalid);
      if (!validKey) {
        throw new VError(
          { info: { code: 'NO_VALID_KEYS' } },
          `No keys valid in list${
            keyData.length ? ` of ${keyData.length} keys` : ''
          }`,
        );
      }
    } catch (e) {
      throw new VError(e, 'Failed to locate valid key in response');
    }

    return validKey.token;
  }

  async fetchAll(keyId: string, net: Net): Promise<Array<string>> {
    const res = await this.fetchers[net].get(`/projects/${keyId}/tokens`);
    if (!Array.isArray(res.data)) {
      throw new VError('Did not receive key list');
    }
    const keyData = res.data as Key[];
    return keyData.map((k) => k.token);
  }
}
