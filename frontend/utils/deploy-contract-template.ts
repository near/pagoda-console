import { connect, KeyPair, keyStores, transactions } from 'near-api-js';

import config from '@/utils/config';
import { authenticatedPost } from '@/utils/http';
import type { Contract, Project } from '@/utils/types';

import type { ContractTemplate } from '../hooks/contract-templates';
import { sleep } from './helpers';

export async function deployContractTemplate(project: Project, template: ContractTemplate) {
  const environmentSubId = 1; // Only TESTNET is supported for now
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const nearConfig = {
    networkId: 'testnet',
    keyStore,
    nodeUrl: config.url.rpc.default.TESTNET,
    helperUrl: 'https://helper.testnet.near.org',
    headers: {},
  };
  const near = await connect(nearConfig);
  const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);
  const accountId = `dev-${Date.now()}-${randomNumber}`;
  const keyPair = KeyPair.fromRandom('ed25519');

  try {
    await near.accountCreator.createAccount(accountId, keyPair.getPublicKey());
    await keyStore.setKey(nearConfig.networkId, accountId, keyPair);

    const [wasmResponse] = await Promise.all([
      fetch(template.wasmFileUrl),
      sleep(1000),
      // This 1 second sleep helps avoid any potential race conditions with the created account not being ready yet
    ]);

    const wasm = await wasmResponse.blob();

    const actions = [
      transactions.deployContract(new Uint8Array(await wasm.arrayBuffer())),
      // Removes key from contract. We are throwing away the key on the frontend, so might as well
      // freeze by deleting the only key to avoid confusion.
      transactions.deleteKey(keyPair.getPublicKey()),
    ];

    // TODO this is hacky way around protected type, find out better way.
    const account: any = await near.account(accountId);
    await account.signAndSendTransaction({
      receiverId: accountId,
      actions: actions,
    });

    // Remove key from browser storage, it was removed from the account.
    await keyStore.removeKey(nearConfig.networkId, accountId);

    const contract = await authenticatedPost<Contract>('/projects/addContract', {
      project: project.slug,
      environment: environmentSubId,
      address: accountId,
    });

    return contract;
  } catch (error) {
    throw error;
  }
}
