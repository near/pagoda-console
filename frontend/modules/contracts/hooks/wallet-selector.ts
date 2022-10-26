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
import { useCurrentEnvironment } from '@/hooks/environments';
import type { NetOption } from '@/utils/types';

// Cache in module to ensure we don't re-init
let selector: WalletSelector | null = null;
let modal: WalletSelectorModal | null = null;

//! *** IMPORTANT ***
// Do not call useWalletSelector hook anywhere but ContractTransaction.tsx. This current implementation is highly
// coupled to being called once in ContractTransaction.tsx and serious side-effects may occur if this is changed.
export const useWalletSelector = (contractId: string | undefined) => {
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const { environment } = useCurrentEnvironment();
  const [prevNet, setPrevNet] = useState<NetOption | undefined>();

  const init = useCallback(async () => {
    if (!contractId || !environment) return null;

    //* Bail early if the environment has changed.
    //* There is some logic in Header.tsx to redirect to the /contracts page
    //* if environment changes and that should take precedence over this flow's window reload.
    if (prevNet && prevNet !== environment.net) {
      return null;
    }
    setPrevNet(environment.net);

    //* This is a hack, this is forcing a reload to be able to refresh the modal component
    //* and wallet selector to allow switching contract.
    //* See: https://github.com/near/wallet-selector/issues/403
    const prevSelection = localStorage.getItem('selectedWalletSelectorContract');
    const currSelection = `${environment.net.toLowerCase()}:${contractId}`;
    if (prevSelection && prevSelection !== currSelection) {
      // sign out
      if (selector && selector.isSignedIn()) {
        const wallet = await selector.wallet();
        await wallet.signOut();
      }

      // We can get the current account and selected contract environment
      localStorage.setItem('selectedWalletSelectorContract', currSelection);
      window.location.reload();
    }

    if (!prevSelection) {
      localStorage.setItem('selectedWalletSelectorContract', currSelection);
    }

    selector = await setupWalletSelector({
      network: environment.net.toLowerCase() as NetworkId,
      modules: [
        setupMyNearWallet({ iconUrl: myNearWalletIconUrl.src }),
        setupSender({ iconUrl: senderIconUrl.src }),
        setupNearWallet({ iconUrl: nearWalletIconUrl.src }),
      ],
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
  }, [contractId, environment, prevNet]);

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

  return {
    selector,
    modal,
    accounts,
    accountId,
  };
};
