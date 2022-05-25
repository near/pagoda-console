import { Net } from '@prisma/client';

export interface Key {
  project_ref: string;
  invalid: boolean;
  created_at: string;
  invalidated_at: string;
  token: string;
  quota: number;
}

export interface KeysServiceInterface {
  createProject(keyId: string, net: Net);
  generate(keyId: string, net: Net);
  invalidate(keyId: string, net: Net);
  rotate(keyId: string, net: Net);
  fetch(keyId: string, net: Net): Promise<string>;
  fetchAll(keyId: string, net: Net): Promise<Array<string>>;
  fetchAllKeys(keyId: string, net: Net): Promise<Array<Key>>;
}
