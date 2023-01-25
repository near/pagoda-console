import { Consumer } from '@pc/rpcaas-client';

export interface ApiKeysProvisioningServiceInterface {
  createOrganization(kongConsumer: string, orgSlug: string);
  generate(kongConsumer: string, keySlug: string);
  rotate(kongConsumer: string, keySlug: string);
  delete(kongConsumer: string, keySlug: string);
  deleteOrganization(kongConsumer: string);
  fetch(keySlug: string): Promise<string>;
  fetchAll(kongConsumer: string): Promise<Array<string> | undefined>;
  getOrganization(kongConsumer: string): Promise<Consumer | null>;
}
