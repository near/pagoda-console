import type { Api } from '@pc/common/types/api';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Box } from '@/components/lib/Box';
import { Flex } from '@/components/lib/Flex';
import { useRouteParam } from '@/hooks/route';
import { styled } from '@/styles/stitches';

import TxForm from './TxForm';
import TxResult from './TxResult';

type Contract = Api.Query.Output<'/projects/getContract'>;

const ContractParams = styled(Box, {
  width: '26.25rem',
  flexShrink: 0,
  flexGrow: 0,

  '@laptop': {
    width: '100%',
  },
});

interface Props {
  contract: Contract;
}

const ContractTransaction = ({ contract }: Props) => {
  // const { accountId, selector } = useWalletSelector(contract.address);
  const [txResult, setTxResult] = useState<any>(undefined);
  const [txError, setTxError] = useState<any>(undefined);
  const transactionHashParam = useRouteParam('transactionHashes');
  const router = useRouter();

  useEffect(() => {
    if (transactionHashParam) {
      const hash = transactionHashParam;
      setTxResult({ hash });
      router.replace(`/contracts/${contract.slug}?tab=interact`);
    }
  }, [transactionHashParam, contract.slug, router]);

  function onTxResult(result: any) {
    const hash = result?.transaction?.hash;
    setTxResult(hash ? { hash } : result);
    setTxError(undefined);
  }

  function onTxError(error: any) {
    setTxResult(undefined);
    setTxError(error);
  }

  // useEffect(() => {
  //   if (accountId) {
  //     analytics.track('DC Contract Connect Wallet', { status: 'success', accountId, contract: contract.address });
  //   }
  // }, [accountId, contract.address]);

  return (
    <Flex gap="l" stack={{ '@laptop': true }}>
      <ContractParams>
        <Flex stack gap="l">
          <TxForm
            // accountId={accountId}
            contract={contract}
            // selector={selector}
            onTxResult={onTxResult}
            onTxError={onTxError}
          />
        </Flex>
      </ContractParams>

      <Box css={{ width: '100%', minWidth: '0' }}>
        <TxResult result={txResult} error={txError} />
      </Box>
    </Flex>
  );
};

export default ContractTransaction;
