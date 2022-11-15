import JSBI from 'jsbi';
import type { AbiParameter, AnyContract as AbiContract } from 'near-abi-client-js';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H5 } from '@/components/lib/Heading';
import { NearInput } from '@/components/lib/NearInput';
import { openToast } from '@/components/lib/Toast';
import { Tooltip } from '@/components/lib/Tooltip';
import { initContractMethods, useAnyAbi } from '@/modules/contracts/hooks/abi';
import { useWalletSelector } from '@/modules/contracts/hooks/wallet-selector';
import * as gasUtils from '@/modules/contracts/utils/convert-gas';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';
import { convertNearToYocto } from '@/utils/convert-near';
import { numberInputHandler } from '@/utils/input-handlers';
import { sanitizeNumber } from '@/utils/sanitize-number';
import { StableId } from '@/utils/stable-ids';
import type { Contract } from '@/utils/types';
import { validateInteger, validateMaxNearU128, validateMaxYoctoU128 } from '@/utils/validations';

import resolveAbiDefinition from '../utils/resolveAbiDefinition';
import TxFormWalletLogin from './TxFormWalletLogin';

const SectionTitle = styled(H5, {
  userSelect: 'none',
});

const UseMaxButton = styled(Button, {
  textTransform: 'uppercase',
  position: 'absolute',
  right: 0,
  top: 0,
  color: 'var(--color-primary) !important',
  fontSize: 'var(--font-size-body-small) !important',

  '&:hover': {
    background: 'transparent !important',
  },
  '&:focus': {
    outline: 'none',
  },

  variants: {
    hidden: {
      true: {
        visibility: 'hidden',
      },
    },
  },
});

interface ContractFormProps {
  contract: Contract;
  onTxResult: (result: any) => void;
  onTxError: (error: any) => void;
}

interface ContractFormData {
  contractFunction: string;
  gas: string;
  deposit: string;
  nearFormat: 'NEAR' | 'yoctoⓃ';
  gasFormat: 'Tgas' | 'Ggas' | 'Mgas' | 'gas';
  [param: string]: any;
}

const TxForm = ({ contract, onTxResult, onTxError }: ContractFormProps) => {
  const { accountId, selector } = useWalletSelector(contract.address);
  const [contractMethods, setContractMethods] = useState<AbiContract | null>(null);
  const form = useForm<ContractFormData>({
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

  const setContractInteractForm = (params: ContractFormData = form.getValues()) =>
    sessionStorage.setItem(`contractInteractForm:${contract.slug}`, JSON.stringify(params));

  const convertNearDeposit = (deposit: string) => {
    switch (nearFormat) {
      case 'NEAR':
        return JSBI.BigInt(convertNearToYocto(deposit));
      case 'yoctoⓃ':
        return JSBI.BigInt(deposit);
      default:
        return JSBI.BigInt(deposit);
    }
  };

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

  const submitForm = async (params: ContractFormData) => {
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
        const attachedDeposit = params.deposit ? convertNearDeposit(params.deposit).toString() : '0';

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

  const ParamInput = ({ param }: { param: AbiParameter }) => {
    const resolved = resolveAbiDefinition(abi!, param.type_schema);
    let fieldType;
    let inputTy;
    if (resolved === 'integer') {
      fieldType = 'number';
      inputTy = 'integer';
    } else if (resolved === 'string') {
      fieldType = 'string';
      inputTy = 'string';
    } else {
      fieldType = 'text';
      inputTy = 'JSON';
    }

    return (
      <Form.Group key={param.name}>
        <Form.FloatingLabelInput
          type={fieldType}
          label={`${param.name}: ${inputTy}`}
          {...form.register(`${param.name}`)}
        />
      </Form.Group>
    );
  };

  return (
    // TODO should this be disabled if the contract is null? Seems like there can be a race
    // TODO condition if submitted before the contract is loaded through the async fn?
    <Form.Root onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Flex stack>
          <SectionTitle>Function</SectionTitle>

          <Controller
            name="contractFunction"
            control={form.control}
            rules={{
              required: 'Please select function',
            }}
            render={({ field }) => {
              const contractFunction = functionItems?.find((option) => option.name === field.value);

              return (
                <Form.Group>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Form.FloatingLabelSelect
                        label="Select Function"
                        isInvalid={!!form.formState.errors.contractFunction}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        selection={contractFunction && contractFunction.name}
                      />
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content align="start" width="trigger">
                      <DropdownMenu.RadioGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                        {functionItems?.map((option) => (
                          <DropdownMenu.RadioItem value={option.name} key={option.name}>
                            {option.name}
                          </DropdownMenu.RadioItem>
                        ))}
                      </DropdownMenu.RadioGroup>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  <Form.Feedback>{form.formState.errors.contractFunction?.message}</Form.Feedback>
                </Form.Group>
              );
            }}
          />

          {selectedFunction?.params
            ? selectedFunction?.params.map((param) => <ParamInput key={param.name} param={param} />)
            : null}
        </Flex>

        {selectedFunction?.is_view && (
          <Flex stack gap="l">
            <Button
              stableId={StableId.CONTRACT_TRANSACTION_VIEW_CALL_BUTTON}
              type="submit"
              loading={form.formState.isSubmitting}
              stretch
            >
              View Call
            </Button>
          </Flex>
        )}

        {selectedFunction && !selectedFunction.is_view && (
          <Flex stack>
            <SectionTitle>Transaction Parameters</SectionTitle>

            <Flex stack>
              <TxFormWalletLogin onBeforeLogIn={setContractInteractForm} />
            </Flex>

            <Flex inline>
              <Form.Group>
                <Tooltip content="On NEAR, all unused gas will be refunded after the transaction.">
                  <Form.FloatingLabelInput
                    type="string"
                    label="Gas:"
                    isInvalid={!!form.formState.errors.gas}
                    onInput={(event) => {
                      numberInputHandler(event, { allowComma: false, allowDecimal: false, allowNegative: false });
                    }}
                    {...form.register(`gas`, {
                      setValueAs: (value) => sanitizeNumber(value),
                      validate: {
                        minValue: (value: string) =>
                          JSBI.greaterThan(JSBI.BigInt(value), JSBI.BigInt(0)) ||
                          'Value must be greater than 0. Try using 10 Tgas',
                        maxValue: (value: string) =>
                          JSBI.lessThan(
                            gasUtils.convertGasByFormat(value, gasFormat),
                            JSBI.BigInt(gasUtils.convertGasToTgas('301')),
                          ) || 'You can attach a maximum of 300 Tgas to a transaction',
                      },
                    })}
                  />
                </Tooltip>

                <Form.Feedback>{form.formState.errors.gas?.message}</Form.Feedback>

                <UseMaxButton
                  stableId={StableId.CONTRACT_TRANSACTION_MAX_GAS_BUTTON}
                  color="transparent"
                  onClick={() => {
                    form.setValue('gas', '300');
                    form.setValue('gasFormat', 'Tgas');
                  }}
                  hidden={Boolean(gas)}
                >
                  Use Max
                </UseMaxButton>
              </Form.Group>

              <DropdownMenu.Root>
                <DropdownMenu.Button
                  stableId={StableId.CONTRACT_TRANSACTION_GAS_FORMAT_DROPDOWN}
                  css={{ width: '9rem' }}
                >
                  {gasFormat}
                </DropdownMenu.Button>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onSelect={() => form.setValue('gasFormat', 'Tgas')}>Tgas</DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => form.setValue('gasFormat', 'Ggas')}>Ggas</DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => form.setValue('gasFormat', 'Mgas')}>Mgas</DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => form.setValue('gasFormat', 'gas')}>gas</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>

            <Flex inline>
              <Form.Group>
                <Controller
                  name="deposit"
                  control={form.control}
                  rules={{
                    validate:
                      nearFormat === 'yoctoⓃ'
                        ? {
                            integer: validateInteger,
                            maxValue: validateMaxYoctoU128,
                          }
                        : {
                            maxValue: validateMaxNearU128,
                          },
                  }}
                  render={({ field }) => (
                    <NearInput
                      yocto={nearFormat === 'yoctoⓃ'}
                      label="Deposit:"
                      field={field}
                      isInvalid={!!form.formState.errors.deposit}
                    />
                  )}
                />

                <Form.Feedback>{form.formState.errors.deposit?.message}</Form.Feedback>
              </Form.Group>

              <DropdownMenu.Root>
                <DropdownMenu.Button
                  stableId={StableId.CONTRACT_TRANSACTION_NEAR_FORMAT_DROPDOWN}
                  css={{ width: '9rem' }}
                >
                  {nearFormat}
                </DropdownMenu.Button>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onSelect={() => form.setValue('nearFormat', 'NEAR')}>NEAR</DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => form.setValue('nearFormat', 'yoctoⓃ')}>yoctoⓃ</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>

            <Button
              stableId={StableId.CONTRACT_TRANSACTION_SEND_BUTTON}
              type="submit"
              loading={form.formState.isSubmitting}
              stretch
            >
              {selectedFunction && selectedFunction.is_view ? 'View Call' : 'Send Transaction'}
            </Button>
          </Flex>
        )}
      </Flex>
    </Form.Root>
  );
};

export default TxForm;
