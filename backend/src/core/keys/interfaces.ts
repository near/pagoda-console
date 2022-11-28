import { Consumer } from './rpcaas-client';

export interface ApiKeysProvisioningServiceInterface {
  createOrganization(kongConsumer: string, orgSlug: string);
  generate(kongConsumer: string, keySlug: string);
  addJwt(
    kongConsumer: string,
    keySlug: string,
    issuer: string,
    publicKey: string,
    algorithm: string,
  );
  rotate(kongConsumer: string, keySlug: string);
  delete(kongConsumer: string, keySlug: string);
  deleteOrganization(kongConsumer: string);
  fetch(keySlug: string): Promise<string>;
  fetchAll(kongConsumer: string): Promise<Array<string> | undefined>;
  getOrganization(kongConsumer: string): Promise<Consumer | null>;
}
