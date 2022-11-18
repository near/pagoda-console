import JSBI from 'jsbi';
import type { AnyContract as AbiContract } from 'near-abi-client-js';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H5 } from '@/components/lib/Heading';
import { openToast } from '@/components/lib/Toast';
import { initContractMethods, useAnyAbi } from '@/modules/contracts/hooks/abi';
import { useWalletSelector } from '@/modules/contracts/hooks/wallet-selector';
import * as gasUtils from '@/modules/contracts/utils/convert-gas';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

import convertNearDeposit from '../utils/convertNearDeposit';
import resolveAbiDefinition from '../utils/resolveAbiDefinition';
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

const TxForm = ({ contract, onTxResult, onTxError }: TxFormProps) => {
  // TODO: simplify the whole logic below

  const { accountId, selector } = useWalletSelector(contract.address);
  const [contractMethods, setContractMethods] = useState<AbiContract | null>(null);
  const form = useForm<TxFormData>({
    defaultValues: {
      gas: '300',
      gasFormat: 'Tgas',
      deposit: '0',
      nearFormat: 'yoctoⓃ',
    },
  });
  const { contractAbi } = useAnyAbi(contract);

  useEffect(() => {
    if (accountId) {
      analytics.track('DC Contract Connect Wallet', { status: 'success', accountId, contract: contract.address });
    }
  }, [accountId, contract.address]);

  const nearFormat = form.watch('nearFormat');
  const gasFormat = form.watch('gasFormat');
  const gas = form.watch('gas');
  const abi = contractMethods?.abi;
  const functionItems = abi?.body.functions;
  const selectedFunctionName = form.watch('contractFunction');
  const selectedFunction = functionItems?.find((option) => option.name === selectedFunctionName);

  const setContractInteractForm = (params: TxFormData = form.getValues()) =>
    sessionStorage.setItem(`contractInteractForm:${contract.slug}`, JSON.stringify(params));

  const initMethods = useCallback(async () => {
    try {
      if (!contractAbi) {
        return;
      }

      const methods = await initContractMethods(contract.net.toLowerCase(), contract.address, contractAbi);
      setContractMethods(methods);
    } catch (error) {
      console.error(error);
    }
  }, [contract.address, contract.net, contractAbi]);

  useEffect(() => {
    initMethods();
  }, [initMethods]);

  useEffect(() => {
    const paramsRaw = sessionStorage.getItem(`contractInteractForm:${contract.slug}`);

    if (paramsRaw) {
      try {
        const params = JSON.parse(paramsRaw);

        for (const param in params) {
          form.setValue(param, params[param]);
        }

        sessionStorage.removeItem(`contractInteractForm:${contract.slug}`);
      } catch (e) {
        console.error('Unable to parse form params from session storage:', e);
      }
    }
  }, [contract.slug, form]);

  useEffect(() => {
    form.clearErrors();
  }, [nearFormat, gasFormat, form]);

  const submitForm = async (params: TxFormData) => {
    // Asserts that contract exists and selected function is valid
    const contractFn = contractMethods![selectedFunction!.name];
    let call;

    setContractInteractForm(params);

    if (selectedFunction?.params) {
      try {
        const fieldParams = selectedFunction.params.map((p) => {
          const value = params[p.name];
          const schema_ty = resolveAbiDefinition(abi!, p.type_schema);
          if (schema_ty === 'integer') {
            return parseInt(value);
          } else if (schema_ty === 'string') {
            // Return value as is, already a string.
            return value;
          } else {
            return JSON.parse(value);
          }
        });
        call = contractFn(...fieldParams);
      } catch (e) {
        console.error(e);
        openToast({
          type: 'error',
          title: 'Invalid Params',
          description: 'Please check your function parameters and try again.',
        });
        return;
      }
    } else {
      call = contractFn();
    }

    let res;

    try {
      if (!selectedFunction?.is_view) {
        // Pull gas/deposit from fields or default. This default will be done by the abi client
        // library, but doing it here to have more control and ensure no hidden bugs.

        const gas = params.gas
          ? gasUtils.convertGasByFormat(params.gas, gasFormat).toString()
          : JSBI.BigInt(10_000_000_000_000).toString();
        const attachedDeposit = params.deposit ? convertNearDeposit(params.deposit, nearFormat).toString() : '0';

        res = await call.callFrom(await selector?.wallet(), {
          gas,
          attachedDeposit,
          // TODO might want to set this when testing the redirect flow (deposit sending txs)
          walletCallbackUrl: undefined,
          signer: accountId,
        });
      } else {
        res = await call.view();
      }
      onTxResult(res);
      openToast({
        type: 'success',
        title: 'Transaction sent successfully',
      });
      analytics.track('DC Contract Interact', {
        status: 'success',
        accountId,
        contract: contract.address,
        function: selectedFunctionName,
      });
    } catch (e: any) {
      console.error(e);
      onTxError(e);
      openToast({
        type: 'error',
        title: 'Failed to send transaction',
      });
      analytics.track('DC Contract Interact', {
        status: 'failure',
        accountId,
        contract: contract.address,
        function: selectedFunctionName,
        error: e.message,
      });
    }
    return null;
  };

  const functionIsSelected = selectedFunction;
  const functionIsView = selectedFunction?.is_view;
  const functionIsTx = selectedFunction && !selectedFunction.is_view;

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
              <TxFormDeposit form={form} nearFormat={nearFormat} />
              <TxFormDepositFormat nearFormat={nearFormat} form={form} />
            </Flex>
          </Flex>
        )}

        <Button
          stableId={StableId.CONTRACT_TRANSACTION_SEND_BUTTON}
          type="submit"
          loading={form.formState.isSubmitting}
          stretch
        >
          {functionIsView ? 'View Call' : 'Send Transaction'}
        </Button>
      </Flex>
    </Form.Root>
  );
};

export default TxForm;
