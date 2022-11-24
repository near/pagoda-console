/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Projects } from '@pc/common/types/core';
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
  async createOrganization(kongConsumer: string, orgSlug: Projects.OrgSlug) {
    return;
  }
  async generate(kongConsumer: string, keySlug: Projects.ApiKeySlug) {
    return this.MOCK_KEY;
  }
  async rotate(kongConsumer: string, keySlug: Projects.ApiKeySlug) {
    return this.MOCK_KEY;
  }
  async delete(kongConsumer: string, keySlug: Projects.ApiKeySlug) {
    return;
  }
  async deleteOrganization(kongConsumer: string) {
    return;
  }
  async fetch(keySlug: Projects.ApiKeySlug): Promise<string> {
    return this.MOCK_KEY;
  }
  async fetchAll(kongConsumer: string): Promise<string[]> {
    return [];
  }
}
