/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ApiKeysProvisioningServiceInterface } from './interfaces';
import { Consumer, ConsumerRateLimitingPolicyEnum } from './rpcaas-client';

@Injectable()
export class ApiKeysMockProvisioningService
  implements ApiKeysProvisioningServiceInterface
{
  private MOCK_KEY = 'mockkey1-2884-439e-880b-a73c8a7bf42d';

  async getOrganization(kongConsumer: string): Promise<Consumer> {
    return {
      custom_id: kongConsumer,
      name: kongConsumer,
      rate_limiting_policy: ConsumerRateLimitingPolicyEnum.Developer,
      username: kongConsumer,
    };
  }
  async createOrganization(kongConsumer: string, orgSlug: string) {
    return;
  }
  async generate(kongConsumer: string, keySlug: string) {
    return this.MOCK_KEY;
  }
  async addJwt(
    kongConsumer: string,
    keySlug: string,
    issuer: string,
    publicKey: string,
    algorithm = 'RS256',
  ) {
    return this.MOCK_KEY;
  }
  async rotate(kongConsumer: string, keySlug: string) {
    return this.MOCK_KEY;
  }
  async delete(kongConsumer: string, keySlug: string) {
    return;
  }
  async deleteOrganization(kongConsumer: string) {
    return;
  }
  async fetch(keySlug: string): Promise<string> {
    return this.MOCK_KEY;
  }
  async fetchAll(kongConsumer: string): Promise<string[]> {
    return [];
  }
}
