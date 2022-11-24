import type { Projects } from '@pc/common/types/core';

import { Button } from '@/components/lib/Button';
import { CopyButton } from '@/components/lib/CopyButton';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { SvgIcon } from '@/components/lib/SvgIcon';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { useContract } from '@/hooks/contracts';
import { useRouteParam } from '@/hooks/route';
import WalletIcon from '@/public/images/icons/wallet.svg';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

import { useWalletSelector } from '../../hooks/wallet-selector';
import type { TxFormWalletLoginProps } from './types';

const ButtonWallet = styled(Button, {
  marginLeft: 'auto',
});

const TxFormWalletLogin = ({ onBeforeLogIn }: TxFormWalletLoginProps) => {
  const contractSlug = (useRouteParam('slug', '/contracts', true) || undefined) as Projects.ContractSlug | undefined;
  const { contract: { address: contractId } = {} } = useContract(contractSlug);
  const { accountId, signOut, modal } = useWalletSelector(contractId);

  const walletSignOut = async () => await signOut(contractId);

  const walletLogIn = () => {
    onBeforeLogIn();
    modal?.show();
  };

  const logedIn = (
    <Flex stack>
      <Flex inline align="center">
        <FeatherIcon icon="user" size="s" />
        <Text weight="semibold" color="text1" css={{ minWidth: 0 }}>
          <TextOverflow>{accountId}</TextOverflow>
        </Text>
        <CopyButton value={accountId} stableId={StableId.WALLET_ACCOUNT_ID_COPY_BUTTON} />

        <ButtonWallet
          stableId={StableId.CONTRACT_TRANSACTION_CONNECT_WALLET_BUTTON}
          color="primaryBorder"
          size="s"
          onClick={walletSignOut}
        >
          <SvgIcon icon={WalletIcon} noFill size="xs" />
          Log out
        </ButtonWallet>
      </Flex>
    </Flex>
  );

  const logedOut = (
    <Flex stack>
      <Flex inline align="center">
        <ButtonWallet
          stableId={StableId.CONTRACT_TRANSACTION_CONNECT_WALLET_BUTTON}
          color="primaryBorder"
          size="m"
          onClick={walletLogIn}
          stretch={true}
        >
          <SvgIcon icon={WalletIcon} noFill size="s" />
          Connect A Wallet
        </ButtonWallet>
      </Flex>
    </Flex>
  );

  return accountId ? logedIn : logedOut;
};

export default TxFormWalletLogin;
