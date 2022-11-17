import type { AccountState, NetworkId, WalletSelector } from '@near-wallet-selector/core';
import { setupWalletSelector } from '@near-wallet-selector/core';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import myNearWalletIconUrl from '@near-wallet-selector/my-near-wallet//assets/my-near-wallet-icon.png';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
import nearWalletIconUrl from '@near-wallet-selector/near-wallet/assets/near-wallet-icon.png';
import { setupSender } from '@near-wallet-selector/sender';
import senderIconUrl from '@near-wallet-selector/sender/assets/sender-icon.png';
import { useCallback, useEffect, useState } from 'react';
import { distinctUntilChanged, map } from 'rxjs';

import { openToast } from '@/components/lib/Toast';
import { useSureProjectContext } from '@/hooks/project-context';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
import { storage } from '@/utils/storage';

// Cache in module to ensure we don't re-init
let selector: WalletSelector | null = null;
let modal: WalletSelectorModal | null = null;

const MULTI_LOGIN_STORAGE_KEY = 'multiLoginStorage';
const WALLET_AUTH_KEY = 'near_app_wallet_auth_key';
const NAJ_KEY_PREFIX = 'near-api-js:keystore:';
const SELECTED_CONTRACT = 'selectedWalletSelectorContract';

//! *** IMPORTANT ***
// Do not call useWalletSelector hook anywhere but ContractTransaction.tsx. This current implementation is highly
// coupled to being called once in ContractTransaction.tsx and serious side-effects may occur if this is changed.
export const useWalletSelector = (contractId: string | undefined) => {
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const { environmentSubId } = useSureProjectContext();
  const [prevEnvironmentSubId, setPrevEnvironmentSubId] = useState<number | undefined>();

  const init = useCallback(async () => {
    if (!contractId) {
      return null;
    }

    //* Bail early if the environment has changed.
    //* There is some logic in Header.tsx to redirect to the /contracts page
    //* if environment changes and that should take precedence over this flow's window reload.
    if (prevEnvironmentSubId && prevEnvironmentSubId !== environmentSubId) {
      return null;
    }
    setPrevEnvironmentSubId(environmentSubId);
    const lowercaseNetwork = mapEnvironmentSubIdToNet(environmentSubId).toLowerCase() as NetworkId;

    //* This is a hack, this is forcing a reload to be able to refresh the modal component
    //* and wallet selector to allow switching contract.
    //* See: https://github.com/near/wallet-selector/issues/403
    const prevSelection = localStorage.getItem(SELECTED_CONTRACT);
    const currSelection = `${lowercaseNetwork}:${contractId}`;

    if (prevSelection && prevSelection !== currSelection) {
      const multiLoginStorage = storage.local.getItem(MULTI_LOGIN_STORAGE_KEY) || {};
      const prevContractId = prevSelection.split(':')[1];
      const prevContractData = multiLoginStorage[prevContractId];
      const currContractData = multiLoginStorage[contractId];

      prevContractData && Object.keys(prevContractData).map((key) => storage.local.removeItem(key));

      currContractData &&
        Object.keys(currContractData).map(
          (key) => currContractData[key] && localStorage.setItem(key, currContractData[key]),
        );

      // We can get the current account and selected contract environment
      localStorage.setItem(SELECTED_CONTRACT, currSelection);
      window.location.reload();
    }

    if (!prevSelection) {
      localStorage.setItem(SELECTED_CONTRACT, currSelection);
    }

    selector = await setupWalletSelector({
      network: lowercaseNetwork,
      modules: [
        setupMyNearWallet({ iconUrl: myNearWalletIconUrl.src }),
        setupSender({ iconUrl: senderIconUrl.src }),
        setupNearWallet({ iconUrl: nearWalletIconUrl.src }),
      ],
      storage: {
        getItem: async (key: string) => {
          return new Promise((resolve) => {
            const value = localStorage.getItem(key);
            setMultiLoginStorage(lowercaseNetwork, contractId, key, value);
            resolve(value);
          });
        },
        setItem: async (key: string, value: string): Promise<void> => {
          return new Promise((resolve) => {
            localStorage.setItem(key, value);
            setMultiLoginStorage(lowercaseNetwork, contractId, key, value);
            resolve();
          });
        },
        removeItem: async (key: string) => {
          return new Promise((resolve) => {
            localStorage.removeItem(key);
            resolve();
          });
        },
      },
    });

    modal = setupModal(selector, {
      contractId,
      // Hardcoding theme so that we don't have to reload screen to re-initialize modal and wallet selector.
      theme: 'dark',
    });

    const state = selector.store.getState();
    setAccounts(state.accounts);

    const subscription = selector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged(),
      )
      .subscribe((nextAccounts) => {
        setAccounts(nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [contractId, environmentSubId, prevEnvironmentSubId]);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      openToast({
        type: 'error',
        title: 'Failed to initialise wallet selector',
      });
    });
  }, [init]);

  const accountId = accounts.find((account) => account.active)?.accountId;

  const signOut = async (contractId: string | undefined) => {
    if (!selector || !contractId) {
      return false;
    }

    const wallet = await selector.wallet();
    await wallet.signOut();

    const multiLoginStorage = storage.local.getItem(MULTI_LOGIN_STORAGE_KEY) || {};
    multiLoginStorage[contractId] && delete multiLoginStorage[contractId];
    storage.local.setItem(MULTI_LOGIN_STORAGE_KEY, multiLoginStorage);
  };

  return {
    selector,
    modal,
    accounts,
    accountId,
    signOut,
  };
};

const setMultiLoginStorage = (network: string | undefined, contractId: string, key: string, value: string | null) => {
  const accountId = storage.local.getItem(WALLET_AUTH_KEY)?.accountId;
  const keystoreKey = `${NAJ_KEY_PREFIX}${accountId}:${network}`;
  const keystoreValue = localStorage.getItem(keystoreKey);
  const multiLoginStorage = storage.local.getItem(MULTI_LOGIN_STORAGE_KEY) || {};

  storage.local.setItem(MULTI_LOGIN_STORAGE_KEY, {
    ...multiLoginStorage,
    [contractId]: {
      ...multiLoginStorage[contractId],
      [key]: value,
      [WALLET_AUTH_KEY]: localStorage.getItem(WALLET_AUTH_KEY),
      [keystoreKey]: keystoreValue,
    },
  });
};
