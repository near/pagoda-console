import type { Api } from '@pc/common/types/api';
import type { AnyContract as AbiContract } from 'near-abi-client-js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Box } from '@/components/lib/Box';
import { Flex } from '@/components/lib/Flex';
import { openToast } from '@/components/lib/Toast';
import { useRawMutation } from '@/hooks/raw-mutation';
import { useRouteParam } from '@/hooks/route';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';

import { initContractMethods, useAnyAbi } from '../../hooks/abi';
import { useWalletSelector } from '../../hooks/wallet-selector';
import resolveAbiDefinition from '../utils/resolveAbiDefinition';
import TxForm from './TxForm';
import TxResult from './TxResult';
import type { MutateInput, TransactionData } from './types';

type Contract = Api.Query.Output<'/projects/getContract'>;

const ContractParams = styled(Box, {
  width: '26.25rem',
  flexShrink: 0,
  flexGrow: 0,

  '@laptop': {
    width: '100%',
  },
});

const getCall = (variables: MutateInput) => {
  // Asserts that contract exists and selected function is valid
  const contractFn = variables.methods![variables.selectedFunction!.name];
  if (variables.selectedFunction?.params) {
    try {
      const fieldParams = variables.selectedFunction.params.map((p) => {
        const value = variables.params[p.name];
        const schema_ty = resolveAbiDefinition(variables.abi!, p.type_schema);
        if (schema_ty === 'integer') {
          return parseInt(value);
        } else if (schema_ty === 'string') {
          // Return value as is, already a string.
          return value;
        } else {
          return JSON.parse(value);
        }
      });
      return contractFn(...fieldParams);
    } catch (e) {
      openToast({
        type: 'error',
        title: 'Invalid Params',
        description: 'Please check your function parameters and try again.',
      });
      return;
    }
  } else {
    return contractFn();
  }
};

interface Props {
  contract: Contract;
}

const ContractTransaction = ({ contract }: Props) => {
  const transactionHashParam = useRouteParam('transactionHashes');
  const router = useRouter();

  useEffect(() => {
    if (transactionHashParam) {
      router.replace(`/contracts/${contract.slug}?tab=interact`);
    }
  }, [transactionHashParam, contract.slug, router]);

  const { accountId, selector } = useWalletSelector(contract.address);
  const sendTransactionMutation = useRawMutation<TransactionData, unknown, MutateInput>(
    async (params) => {
      const call = getCall(params);
      if (!params.selectedFunction?.is_view) {
        return call.callFrom(await selector?.wallet(), {
          gas: params.gas,
          attachedDeposit: params.deposit,
          // TODO might want to set this when testing the redirect flow (deposit sending txs)
          walletCallbackUrl: undefined,
          signer: accountId,
        });
      } else {
        return call.view();
      }
    },
    {
      onSuccess: (_result, variables) => {
        openToast({
          type: 'success',
          title: 'Transaction sent successfully',
        });
        analytics.track('DC Contract Interact', {
          status: 'success',
          accountId,
          contract: contract.address,
          function: variables.selectedFunction!.name,
        });
      },
      onError: (e, variables) => {
        openToast({
          type: 'error',
          title: 'Failed to send transaction',
        });
        analytics.track('DC Contract Interact', {
          status: 'failure',
          accountId,
          contract: contract.address,
          function: variables.selectedFunction!.name,
          error: (e as any).message,
        });
      },
    },
  );

  const [contractMethods, setContractMethods] = useState<AbiContract | null>(null);

  const abis = useAnyAbi(contract);
  const contractAbi = abis.embeddedQuery.data?.abi || abis.privateQuery.data?.abi;
  useEffect(() => {
    if (!contractAbi) {
      return;
    }
    initContractMethods(contract.net.toLowerCase(), contract.address, contractAbi).then(setContractMethods);
  }, [contract.address, contract.net, contractAbi]);

  const sendTransactionMutationData = transactionHashParam
    ? { hash: transactionHashParam }
    : (sendTransactionMutation.data as any)?.transaction?.hash
    ? { hash: (sendTransactionMutation.data as any)?.transaction?.hash }
    : sendTransactionMutation.data;

  return (
    <Flex gap="l" stack={{ '@laptop': true }}>
      <ContractParams>
        <Flex stack gap="l">
          <TxForm contract={contract} methods={contractMethods} mutation={sendTransactionMutation} />
        </Flex>
      </ContractParams>

      <Box css={{ width: '100%', minWidth: '0' }}>
        <TxResult result={sendTransactionMutationData} error={sendTransactionMutation.error} />
      </Box>
    </Flex>
  );
};

export default ContractTransaction;
