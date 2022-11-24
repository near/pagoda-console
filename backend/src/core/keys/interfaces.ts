import { Projects } from '@pc/common/types/core';
import { Consumer } from './rpcaas-client';

export interface ApiKeysProvisioningServiceInterface {
  createOrganization(kongConsumer: string, orgSlug: Projects.OrgSlug);
  generate(kongConsumer: string, keySlug: Projects.ApiKeySlug);
  rotate(kongConsumer: string, keySlug: Projects.ApiKeySlug);
  delete(kongConsumer: string, keySlug: Projects.ApiKeySlug);
  deleteOrganization(kongConsumer: string);
  fetch(keySlug: Projects.ApiKeySlug): Promise<string>;
  fetchAll(kongConsumer: string): Promise<Array<string> | undefined>;
  getOrganization(kongConsumer: string): Promise<Consumer | null>;
}
