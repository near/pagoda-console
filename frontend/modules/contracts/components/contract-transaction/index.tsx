import type { Api } from '@pc/common/types/api';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import TransactionActions from '@/components/explorer/transaction/TransactionActions';
import { NetContext } from '@/components/explorer/utils/NetContext';
import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import { CodeBlock } from '@/components/lib/CodeBlock';
import { Flex } from '@/components/lib/Flex';
import { H3, H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Message } from '@/components/lib/Message';
import { SvgIcon } from '@/components/lib/SvgIcon';
import { Text } from '@/components/lib/Text';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { useWalletSelector } from '@/modules/contracts/hooks/wallet-selector';
import TxList from '@/public/contracts/images/TxList.svg';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';

import ContractTransactionForm from './ContractTransactionForm';

type Contract = Api.Query.Output<'/projects/getContract'>;

const TextItalic = styled(Text, {
  fontStyle: 'italic',
});
const ResultTitle = styled(H5, {
  userSelect: 'none',
});
const ListWrapper = styled(List, {
  [`& ${ListItem}`]: {
    color: 'var(--color-text-1)',

    '&::marker': {
      color: 'inherit',
    },
  },
});
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
  const { accountId, selector } = useWalletSelector(contract.address);
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

  useEffect(() => {
    if (accountId) {
      analytics.track('DC Contract Connect Wallet', { status: 'success', accountId, contract: contract.address });
    }
  }, [accountId, contract.address]);

  return (
    <Flex gap="l" stack={{ '@laptop': true }}>
      <ContractParams>
        <Flex stack gap="l">
          <ContractTransactionForm
            accountId={accountId}
            contract={contract}
            selector={selector}
            onTxResult={onTxResult}
            onTxError={onTxError}
          />
        </Flex>
      </ContractParams>

      <Box css={{ width: '100%', minWidth: '0' }}>
        <TxResultView result={txResult} error={txError} />
      </Box>
    </Flex>
  );
};

const TxResultView = ({ result, error }: { result: any; error: any }) => {
  if (!result && !error) {
    return <SendTransactionBanner />;
  }

  if (error) {
    return (
      <Flex stack>
        <ResultTitle>Result</ResultTitle>
        <Message type="error" content={error.toString()} />
      </Flex>
    );
  }

  if (result?.hash) {
    const hash = result?.hash as string;
    return (
      <Flex stack>
        <ResultTitle>Result</ResultTitle>
        <TxResultHash hash={hash} />
      </Flex>
    );
  }

  return (
    <Flex stack>
      <ResultTitle>Result</ResultTitle>
      <TxResult result={result} />
    </Flex>
  );
};

const SendTransactionBanner = () => (
  <Card padding="xl">
    <Flex>
      <Box>
        <SvgIcon size="xl" color="success" icon={TxList} />
      </Box>
      <Flex stack gap="l">
        <H3>Sending a Transaction</H3>
        <ListWrapper as="ol">
          <ListItem>Select Function</ListItem>
          <ListItem>Input function parameters</ListItem>
          <ListItem>Send transaction</ListItem>
        </ListWrapper>
        <TextItalic>The transaction execution and history will show up here</TextItalic>
      </Flex>
    </Flex>
  </Card>
);

const TxResult = ({ result }: { result: any }) => (
  <Card padding="l">
    <Box>
      <CodeBlock>{JSON.stringify(result, null, 2)}</CodeBlock>
    </Box>
  </Card>
);

const TxResultHash = ({ hash }: { hash: string }) => {
  const { environment } = useSelectedProject();
  const net = environment?.net;

  if (!net) {
    return <></>;
  }

  return (
    <Card padding="l">
      <Box>
        <NetContext.Provider value={net}>
          <TransactionActions transactionHash={hash} />
        </NetContext.Provider>
      </Box>
    </Card>
  );
};

export default ContractTransaction;
