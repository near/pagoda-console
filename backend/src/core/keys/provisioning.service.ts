import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/validate';
import { ApiKeysProvisioningServiceInterface } from './interfaces';
import {
  Configuration,
  ConsumerApi,
  ConsumerRateLimitingPolicyEnum,
  SecretApi,
  SecretBody,
  SecretBodyKongCredTypeEnum,
} from './rpcaas-client';
import { VError } from 'verror';
import { ApiConsumer } from './types';

@Injectable()
export class ApiKeysProvisioningService
  implements ApiKeysProvisioningServiceInterface
{
  private consumerClient: ConsumerApi;
  private secretClient: SecretApi;

  constructor(private config: ConfigService<AppConfig>) {
    const rpcProvisioningService = this.config.get('rpcProvisioningService', {
      infer: true,
    })!;
    if (rpcProvisioningService.mock) {
      throw new Error(
        'Unexpected mock rpcProvisioningService in an actual service!',
      );
    }
    const configuration: Configuration = {
      apiKey: rpcProvisioningService.apiKey,
      basePath: rpcProvisioningService.url,
    };

    this.consumerClient = new ConsumerApi(configuration);
    this.secretClient = new SecretApi(configuration);
  }

  async createOrganization(kongConsumer: string, orgSlug: string) {
    try {
      await this.createConsumer(kongConsumer, orgSlug);
    } catch (e: any) {
      console.error(e);
      throw new VError(e, 'Failed while creating org');
    }
  }

  async generate(kongConsumer: string, keySlug: string) {
    const keyName = this.getKeyName(keySlug);
    const body: SecretBody = {
      kongCredType: SecretBodyKongCredTypeEnum.KeyAuth,
      name: keyName,
    };
    try {
      await this.secretClient.createConsumerSecret(
        body,
        this.getConsumerName(kongConsumer),
      );
    } catch (e: any) {
      throw new VError(e, 'Failed while generating key');
    }
  }

  async addJwt(
    kongConsumer: string,
    keySlug: string,
    issuer: string,
    publicKey: string,
    algorithm = 'RS256',
  ) {
    const keyName = this.getKeyName(keySlug);
    const body: SecretBody = {
      kongCredType: SecretBodyKongCredTypeEnum.Jwt,
      name: keyName,
      key: issuer, // TODO is this where I store the issuer?
      rsaPublicKey: publicKey,
      algorithm,
    };
    try {
      await this.secretClient.createConsumerSecret(
        body,
        this.getConsumerName(kongConsumer),
      );
    } catch (e: any) {
      throw new VError(e, 'Failed while adding JWT key');
    }
  }

  async rotate(kongConsumer: string, keySlug: string) {
    try {
      await this.delete(kongConsumer, keySlug);
      await this.generate(kongConsumer, keySlug);
    } catch (e: any) {
      throw new VError(e, 'Failed while rotating key');
    }
  }

  async delete(kongConsumer: string, keySlug: string) {
    try {
      await this.secretClient.deleteSecret(
        this.getConsumerName(kongConsumer),
        this.getKeyName(keySlug),
      );
    } catch (e: any) {
      throw new VError(e, 'Failed while deleting key');
    }
  }

  async deleteOrganization(kongConsumer: string) {
    try {
      await this.consumerClient.deleteConsumer(
        this.getConsumerName(kongConsumer),
      );
    } catch (e: any) {
      throw new VError(e, 'Failed while deleting org');
    }
  }

  async fetch(keySlug: string): Promise<string> {
    try {
      const keyName = this.getKeyName(keySlug);
      const data = (await this.secretClient.getSecret(keyName)).data;
      return data.api_token || data.rsaPublicKey!;
    } catch (e: any) {
      throw new VError(e, 'Failed while fetching a key');
    }
  }

  async fetchAll(kongConsumer: string): Promise<string[] | undefined> {
    try {
      const res = await this.secretClient.getConsumerSecrets(
        this.getConsumerName(kongConsumer),
      );
      return res.data.keys?.map((el) => {
        const data = el;
        return data.api_token || data.rsaPublicKey!;
      });
    } catch (e: any) {
      throw new VError(e, 'Failed while fetching keys');
    }
  }

  async getOrganization(kongConsumer: string): Promise<ApiConsumer | null> {
    try {
      const res = await this.consumerClient.getConsumer(kongConsumer);
      return {
        ...res.data,
        name: kongConsumer,
      };
    } catch (e: any) {
      if (e.response.status === 404) return null;
      else throw new VError(e, 'Failed while getting organization');
    }
  }

  private async createConsumer(kongConsumer: string, orgSlug: string) {
    const username = this.getConsumerName(kongConsumer);
    const consumer: ApiConsumer = {
      custom_id: orgSlug,
      name: username,
      rate_limiting_policy: ConsumerRateLimitingPolicyEnum.Developer,
      username,
    };
    try {
      await this.consumerClient.upsertConsumer(consumer, username);
    } catch (e: any) {
      throw new VError(e, 'Failed while creating kong consumer');
    }
  }

  private getConsumerName(kongConsumer: string) {
    return kongConsumer;
  }

  private getKeyName(keySlug: string) {
    return keySlug;
  }
}
