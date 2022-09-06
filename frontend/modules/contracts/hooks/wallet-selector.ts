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
import { useSelectedProject } from '@/hooks/selected-project';
import { useThemeStore } from '@/modules/core/components/ThemeToggle';

export const useWalletSelector = (contractId: string | undefined) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const { activeTheme } = useThemeStore();
  const { environment } = useSelectedProject();

  const init = useCallback(async () => {
    if (!contractId || !environment) return null;

    const waletSelector = await setupWalletSelector({
      network: environment.net.toLowerCase() as NetworkId,
      modules: [
        setupMyNearWallet({ iconUrl: myNearWalletIconUrl.src }),
        setupSender({ iconUrl: senderIconUrl.src }),
        setupNearWallet({ iconUrl: nearWalletIconUrl.src }),
      ],
    });
    const selectModal = setupModal(waletSelector, {
      contractId,
      theme: activeTheme,
    });
    const state = waletSelector.store.getState();
    setAccounts(state.accounts);

    setSelector(waletSelector);
    setModal(selectModal);
  }, [activeTheme, contractId, environment]);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      openToast({
        type: 'error',
        title: 'Failed to initialise wallet selector',
      });
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged(),
      )
      .subscribe((nextAccounts) => {
        console.log('Accounts Update', nextAccounts);

        setAccounts(nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  const accountId = accounts.find((account) => account.active)?.accountId;

  return {
    selector,
    modal,
    accounts,
    accountId,
  };
};
