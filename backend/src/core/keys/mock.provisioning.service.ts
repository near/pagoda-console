/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ApiKeysProvisioningServiceInterface } from './interfaces';
import { Consumer, ConsumerRateLimitingPolicyEnum } from './rpcaas-client';

@Injectable()
export class ApiKeysMockProvisioningService
  implements ApiKeysProvisioningServiceInterface
{
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
    return keySlug;
  }
  async rotate(kongConsumer: string, keySlug: string) {
    return keySlug;
  }
  async delete(kongConsumer: string, keySlug: string) {
    return;
  }
  async deleteOrganization(kongConsumer: string) {
    return;
  }
  async fetch(keySlug: string): Promise<string> {
    return keySlug;
  }
  async fetchAll(kongConsumer: string): Promise<string[]> {
    return [];
  }
}
