import type { WalletSelector } from '@near-wallet-selector/core';
import { BN } from 'bn.js';
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
import { NearInput } from '@/components/lib/NearInput';
import { Spinner } from '@/components/lib/Spinner';
import { SvgIcon } from '@/components/lib/SvgIcon';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { openToast } from '@/components/lib/Toast';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { initContractMethods, useContractAbi } from '@/modules/contracts/hooks/abi';
import { useWalletSelector } from '@/modules/contracts/hooks/wallet-selector';
import TxList from '@/public/contracts/images/TxList.svg';
import WalletIcon from '@/public/images/icons/wallet.svg';
import { styled } from '@/styles/stitches';
import type { Contract } from '@/utils/types';
import { validateMaxYoctoU128 } from '@/utils/validations';

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
  const handleWalletSelect = useCallback(() => modal?.show(), [modal]);
  const [txResult, setTxResult] = useState<any>(undefined);
  const transactionHashParam = useRouteParam('transactionHashes');
  const router = useRouter();

  useEffect(() => {
    if (transactionHashParam) {
      const hash = transactionHashParam;

      setTimeout(() => {
        setTxResult({ hash });
        router.replace(`/contracts/${contract.slug}?tab=interact`);
      }, 1000); // This timeout avoids a race condition where the transaction isn't quite ready yet
    }
  }, [transactionHashParam, contract.slug, router]);

  function onTxResult(result: any) {
    const hash = result?.transaction?.hash;
    setTxResult(hash ? { hash } : result);
  }

  function onTxError() {
    setTxResult(undefined);
  }

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

      <Box css={{ width: '100%' }}>
        {transactionHashParam ? <Spinner center /> : <TxResultView result={txResult} />}
      </Box>
    </Flex>
  );
};

interface ContractFormProps {
  accountId?: string;
  contract: Contract;
  selector: WalletSelector | null;
  onTxResult: (result: any) => void;
  onTxError: () => void;
}

const ContractTransactionForm = ({ accountId, contract, selector, onTxResult, onTxError }: ContractFormProps) => {
  const [contractMethods, setContractMethods] = useState<AbiContract | null>(null);
  const form = useForm<{ contractFunction: string; gas: string; deposit: string } & any>();
  const { contractAbi } = useContractAbi(contract?.slug);

  const signedIn = (accountId: string | undefined, wallet: WalletSelector | null): boolean => {
    // TODO determine if certain wallets leave the account id undefined when signed in.
    return accountId != undefined && wallet != null;
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

  const abi = contractMethods?.abi;
  const functionItems = abi?.body.functions;
  const selectedFunctionName = form.watch('contractFunction');
  const selectedFunction = functionItems?.find((option) => option.name === selectedFunctionName);

  const submitForm = async (params: any) => {
    // Asserts that contract exists and selected function is valid
    const contractFn = contractMethods![selectedFunction!.name];
    let call;

    sessionStorage.setItem(`contractInteractForm:${contract.slug}`, JSON.stringify(params));

    if (selectedFunction?.params) {
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
    } else {
      call = contractFn();
    }

    let res;

    try {
      if (!selectedFunction?.is_view) {
        // Pull gas/deposit from fields or default. This default will be done by the abi client
        // library, but doing it here to have more control and ensure no hidden bugs.
        const gas = params.gas ? new BN(params.gas) : new BN(10_000_000_000_000);
        const attachedDeposit = params.deposit ? new BN(params.deposit) : new BN(0);

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
    } catch (e) {
      console.error(e);
      onTxError();
      openToast({
        duration: Infinity,
        type: 'error',
        title: 'Failed to send transaction',
        description: `${e}`,
      });
    }
    return null;
  };

  const TransactionParameters = () => {
    if (selectedFunction) {
      if (selectedFunction?.is_view) {
        return (
          <Flex stack gap="l">
            <Button type="submit" loading={form.formState.isSubmitting} stretch>
              View Call
            </Button>
          </Flex>
        );
      } else {
        return (
          <Flex stack>
            <SectionTitle>3. Transaction Parameters</SectionTitle>
            <Form.Group>
              <Form.FloatingLabelInput
                type="string"
                label="Gas: defaults to 10 TeraGas"
                {...form.register('gas')}
                // TODO this field should be validated as gas
              />
            </Form.Group>

            <Form.Group>
              <Controller
                name="deposit"
                control={form.control}
                rules={{
                  validate: {
                    maxValue: validateMaxYoctoU128,
                  },
                }}
                render={({ field }) => (
                  <NearInput
                    yocto
                    label="Deposit: defaults to 0"
                    field={field}
                    isInvalid={!!form.formState.errors.deposit}
                  />
                )}
              />
              <Form.Feedback>{form.formState.errors.deposit?.message}</Form.Feedback>
            </Form.Group>

            <Button type="submit" loading={form.formState.isSubmitting} stretch>
              {selectedFunction && selectedFunction.is_view ? 'View Call' : 'Send Transaction'}
            </Button>
          </Flex>
        );
      }
    } else {
      return null;
    }
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
          isInvalid={!!form.formState.errors?.name}
          {...form.register(`${param.name}`)}
        />
        <Form.Feedback>{form.formState.errors.name?.message}</Form.Feedback>
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

          <TransactionParameters />
        </Flex>
      </Form.Root>
    </FormWrapper>
  );
};

const TxResultView = ({ result }: { result: any }) => {
  if (result === undefined) {
    return <SendTransactionBanner />;
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
