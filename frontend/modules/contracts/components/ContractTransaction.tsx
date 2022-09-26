import type { WalletSelector } from '@near-wallet-selector/core';
import JSBI from 'jsbi';
import type { AbiParameter, AbiRoot, AnyContract as AbiContract } from 'near-abi-client-js';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import TransactionActions from '@/components/explorer/transaction/TransactionActions';
import { NetContext } from '@/components/explorer/utils/NetContext';
import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { CodeBlock } from '@/components/lib/CodeBlock';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H3, H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Message } from '@/components/lib/Message';
import { NearInput } from '@/components/lib/NearInput';
import { SvgIcon } from '@/components/lib/SvgIcon';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { openToast } from '@/components/lib/Toast';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { initContractMethods, useAnyAbi } from '@/modules/contracts/hooks/abi';
import { useWalletSelector } from '@/modules/contracts/hooks/wallet-selector';
import * as gasUtils from '@/modules/contracts/utils/convert-gas';
import TxList from '@/public/contracts/images/TxList.svg';
import WalletIcon from '@/public/images/icons/wallet.svg';
import { styled } from '@/styles/stitches';
import analytics from '@/utils/analytics';
import { convertNearToYocto } from '@/utils/convert-near';
import { numberInputHandler } from '@/utils/input-handlers';
import { sanitizeNumber } from '@/utils/sanitize-number';
import type { Contract } from '@/utils/types';
import { validateInteger, validateMaxNearU128, validateMaxYoctoU128 } from '@/utils/validations';

const TextItalic = styled(Text, {
  fontStyle: 'italic',
});
const SectionTitle = styled(H5, {
  userSelect: 'none',
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
const FormWrapper = styled(Box, {
  width: '100%',

  variants: {
    disabled: {
      true: {
        [`& ${SectionTitle}`]: {
          color: 'var(--color-text-3)',
        },
      },
    },
  },
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
    outline: 'none'
  },

  variants: {
    hidden: {
      true: {
        visibility: 'hidden',
      }
    }
  }
});

interface Props {
  contract: Contract;
}

// Recursively resolve references to collapse type.
// This is useful to be able to infer the actual types of data and avoid accepting the
// fallback JSON input when possible.
const resolveDefinition = (abi: AbiRoot, def: any) => {
  const jsonRoot = abi.body.root_schema;
  while (def && def.$ref) {
    const ref: string = def.$ref;
    if (ref.slice(0, 14) === '#/definitions/') {
      // It's a JSON Pointer reference, resolve the type.
      const defName = ref.slice(14);
      if (!jsonRoot.definitions || !jsonRoot.definitions[defName]) {
        break;
      }

      def = jsonRoot.definitions[defName];
    }
  }
  return def.type;
};

export const ContractTransaction = ({ contract }: Props) => {
  const { accountId, modal, selector } = useWalletSelector(contract.address);
  const handleWalletSelect = useCallback(async () => {
    if (selector && selector.store.getState().selectedWalletId) {
      const wallet = await selector.wallet();
      await wallet.signOut();
    }
    modal?.show();
  }, [modal, selector]);
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
          <Flex stack>
            <SectionTitle>1. Account</SectionTitle>
            <Flex inline align="center">
              {accountId ? (
                <>
                  <FeatherIcon icon="user" size="s" />
                  <Text weight="semibold" color="text1" css={{ minWidth: 0 }}>
                    <TextOverflow>{accountId}</TextOverflow>
                  </Text>
                </>
              ) : null}
              <Button
                color="primaryBorder"
                size={!accountId ? 'm' : 's'}
                onClick={handleWalletSelect}
                stretch={!accountId}
                css={{ marginLeft: 'auto' }}
              >
                <SvgIcon icon={WalletIcon} noFill size={!accountId ? 's' : 'xs'} />
                {!accountId ? 'Connect A Wallet' : 'Change'}
              </Button>
            </Flex>
          </Flex>

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

interface ContractFormProps {
  accountId?: string;
  contract: Contract;
  selector: WalletSelector | null;
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

const ContractTransactionForm = ({ accountId, contract, selector, onTxResult, onTxError }: ContractFormProps) => {
  const [contractMethods, setContractMethods] = useState<AbiContract | null>(null);
  const form = useForm<ContractFormData>();
  const { contractAbi } = useAnyAbi(contract);

  const nearFormat = form.watch('nearFormat');
  const gasFormat = form.watch('gasFormat');
  const gas = form.watch('gas');
  const abi = contractMethods?.abi;
  const functionItems = abi?.body.functions;
  const selectedFunctionName = form.watch('contractFunction');
  const selectedFunction = functionItems?.find((option) => option.name === selectedFunctionName);

  const signedIn = (accountId: string | undefined, wallet: WalletSelector | null): boolean => {
    // TODO determine if certain wallets leave the account id undefined when signed in.
    return accountId != undefined && wallet != null;
  };

  const convertGas = (gas: string) => {
    switch (gasFormat) {
      case 'Tgas':
        return JSBI.BigInt(gasUtils.convertGasToTgas(gas));
      case 'Ggas':
        return JSBI.BigInt(gasUtils.convertGasToGgas(gas));
      case 'Mgas':
        return JSBI.BigInt(gasUtils.convertGasToMgas(gas));
      case 'gas':
        return JSBI.BigInt(gas);
      default:
        return JSBI.BigInt(gasUtils.convertGasToTgas(gas));
    }
  };

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
      if (!signedIn(accountId, selector) || !contractAbi) {
        return;
      }

      const methods = await initContractMethods(contract.net.toLowerCase(), contract.address, contractAbi);
      setContractMethods(methods);
    } catch (error) {
      console.error(error);
    }
  }, [accountId, selector, contract.address, contract.net, contractAbi]);

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
    if (!form.getValues('nearFormat')) form.setValue('nearFormat', 'yoctoⓃ');
    if (!form.getValues('gasFormat')) form.setValue('gasFormat', 'Tgas');
    form.clearErrors();
  }, [nearFormat, gasFormat, form]);

  const submitForm = async (params: ContractFormData) => {
    // Asserts that contract exists and selected function is valid
    const contractFn = contractMethods![selectedFunction!.name];
    let call;

    sessionStorage.setItem(`contractInteractForm:${contract.slug}`, JSON.stringify(params));

    if (selectedFunction?.params) {
      try {
        const fieldParams = selectedFunction.params.map((p) => {
          const value = params[p.name];
          const schema_ty = resolveDefinition(abi!, p.type_schema);
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

        const gas = params.gas ? convertGas(params.gas).toString() : JSBI.BigInt(10_000_000_000_000).toString();
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
    const resolved = resolveDefinition(abi!, param.type_schema);
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
    <FormWrapper disabled={!signedIn(accountId, selector)}>
      <Form.Root disabled={!signedIn(accountId, selector)} onSubmit={form.handleSubmit(submitForm)}>
        <Flex stack gap="l">
          <Flex stack>
            <SectionTitle>2. Function</SectionTitle>

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
              <Button type="submit" loading={form.formState.isSubmitting} stretch>
                View Call
              </Button>
            </Flex>
          )}

          {selectedFunction && !selectedFunction.is_view && (
            <Flex stack>
              <SectionTitle>3. Transaction Parameters</SectionTitle>

              <Flex inline>
                <Form.Group>
                  <Form.FloatingLabelInput
                    type="string"
                    label="Gas:"
                    isInvalid={!!form.formState.errors.gas}
                    defaultValue="10"
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
                          JSBI.lessThan(convertGas(value), JSBI.BigInt(gasUtils.convertGasToTgas('301'))) ||
                          'You can attach a maximum of 300 Tgas to a transaction',
                      },
                    })}
                  />

                  <Form.Feedback>{form.formState.errors.gas?.message}</Form.Feedback>

                  <UseMaxButton
                    color='transparent'
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
                  <DropdownMenu.Button css={{ width: '9rem' }}>{gasFormat}</DropdownMenu.Button>
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
                    defaultValue="0"
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
                  <DropdownMenu.Button css={{ width: '9rem' }}>{nearFormat}</DropdownMenu.Button>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onSelect={() => form.setValue('nearFormat', 'NEAR')}>NEAR</DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => form.setValue('nearFormat', 'yoctoⓃ')}>yoctoⓃ</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>

              <Button type="submit" loading={form.formState.isSubmitting} stretch>
                {selectedFunction && selectedFunction.is_view ? 'View Call' : 'Send Transaction'}
              </Button>
            </Flex>
          )}
        </Flex>
      </Form.Root>
    </FormWrapper>
  );
};

const TxResultView = ({ result, error }: { result: any, error: any }) => {
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
          <ListItem>Connect Wallet</ListItem>
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
