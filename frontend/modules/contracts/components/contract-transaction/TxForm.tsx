import JSBI from 'jsbi';
import { AbiFunctionKind } from 'near-abi-client-js';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H5 } from '@/components/lib/Heading';
import { useWalletSelector } from '@/modules/contracts/hooks/wallet-selector';
import * as gasUtils from '@/modules/contracts/utils/convert-gas';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

import convertNearDeposit from '../utils/convertNearDeposit';
import TxFormDeposit from './TxFormDeposit';
import TxFormDepositFormat from './TxFormDepositFormat';
import TxFormFunctionParams from './TxFormFunctionParams';
import TxFormGas from './TxFormGas';
import TxFormGasFormat from './TxFormGasFormat';
import TxFormSelectFunction from './TxFormSelectFunction';
import TxFormWalletLogin from './TxFormWalletLogin';
import type { TxFormData, TxFormProps } from './types';

const SectionTitle = styled(H5, {
  userSelect: 'none',
});

const TxForm = ({ contract, mutation, methods }: TxFormProps) => {
  const { accountId } = useWalletSelector(contract.address);
  const form = useForm<TxFormData>({
    defaultValues: {
      gasValue: '300',
      gasFormat: 'Tgas',
      depositValue: '0',
      depositFormat: 'yoctoⓃ',
      params: {},
    },
  });

  useEffect(() => {
    if (accountId) {
      analytics.track('DC Contract Connect Wallet', { status: 'success', accountId, contract: contract.address });
    }
  }, [accountId, contract.address]);

  const depositFormat = form.watch('depositFormat');
  const gasFormat = form.watch('gasFormat');
  const gas = form.watch('gasValue');
  const abi = methods?.abi;
  const functionItems = abi?.body.functions;
  const selectedFunctionName = form.watch('contractFunction');
  const selectedFunction = functionItems?.find((option) => option.name === selectedFunctionName);

  const setContractInteractForm = useCallback(
    (params: TxFormData = form.getValues()) =>
      sessionStorage.setItem(`contractInteractForm:${contract.slug}`, JSON.stringify(params)),
    [contract.slug, form],
  );

  useEffect(() => {
    const paramsRaw = sessionStorage.getItem(`contractInteractForm:${contract.slug}`);

    if (paramsRaw) {
      try {
        const params = JSON.parse(paramsRaw);

        for (const param in params) {
          form.setValue(`params.${param}`, params[param]);
        }

        sessionStorage.removeItem(`contractInteractForm:${contract.slug}`);
      } catch (e) {
        console.error('Unable to parse form params from session storage:', e);
      }
    }
  }, [contract.slug, form]);

  useEffect(() => {
    form.clearErrors();
  }, [depositFormat, gasFormat, form]);

  const submitForm = async (form: TxFormData) => {
    setContractInteractForm(form);
    // Pull gas/deposit from fields or default. This default will be done by the abi client
    // library, but doing it here to have more control and ensure no hidden bugs.
    mutation.mutate({
      gas: form.gasValue
        ? gasUtils.convertGasByFormat(form.gasValue, form.gasFormat).toString()
        : JSBI.BigInt(10_000_000_000_000).toString(),
      deposit: form.depositValue ? convertNearDeposit(form.depositValue, form.depositFormat).toString() : '0',
      selectedFunction,
      params: form.params,
      methods,
      abi,
    });
  };

  const functionIsSelected = selectedFunction;
  const functionIsView = selectedFunction?.kind === AbiFunctionKind.View;
  const functionIsTx = selectedFunction?.kind === AbiFunctionKind.Call;

  return (
    // TODO should this be disabled if the contract is null? Seems like there can be a race
    // TODO condition if submitted before the contract is loaded through the async fn?
    <Form.Root onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Flex stack>
          <SectionTitle>Function</SectionTitle>

          <TxFormSelectFunction form={form} functionItems={functionItems} />

          {functionIsSelected && <TxFormFunctionParams selectedFunction={selectedFunction} form={form} abi={abi} />}
        </Flex>

        {functionIsTx && (
          <Flex stack>
            <SectionTitle>Transaction Parameters</SectionTitle>

            <TxFormWalletLogin onBeforeLogIn={setContractInteractForm} />

            <Flex inline>
              <TxFormGas form={form} gasFormat={gasFormat} gas={gas} />
              <TxFormGasFormat gasFormat={gasFormat} form={form} />
            </Flex>

            <Flex inline>
              <TxFormDeposit form={form} nearFormat={depositFormat} />
              <TxFormDepositFormat nearFormat={depositFormat} form={form} />
            </Flex>
          </Flex>
        )}

        <Button stableId={StableId.CONTRACT_TRANSACTION_SEND_BUTTON} type="submit" loading={mutation.isLoading} stretch>
          {functionIsView ? 'View Call' : 'Send Transaction'}
        </Button>
      </Flex>
    </Form.Root>
  );
};

export default TxForm;
