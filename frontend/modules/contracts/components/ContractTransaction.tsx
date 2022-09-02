import type { WalletSelector } from '@near-wallet-selector/core';
import type { AnyContract as AbiContract } from 'near-abi-client-js';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H3, H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { SvgIcon } from '@/components/lib/SvgIcon';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { initContractMethods, useContractAbi } from '@/modules/contracts/hooks/abi';
import { useWalletSelector } from '@/modules/contracts/hooks/wallet-selector';
import TxList from '@/public/contracts/images/TxList.svg';
import { styled } from '@/styles/stitches';
import type { Contract } from '@/utils/types';

const TextItalic = styled(Text, {
  fontStyle: 'italic',
});
const Heading = styled(H3, {
  lineHeight: '52px',
});
const SectionTitle = styled(H5, {
  marginTop: '1rem',
  marginBottom: '1rem',
  userSelect: 'none',
});
const ListWrapper = styled(List, {
  marginTop: 24,
  marginBottom: 24,

  [`& ${ListItem}`]: {
    color: 'var(--color-text-1)',

    '&::marker': {
      color: 'inherit',
    },
  },
});
const ContractParams = styled(Box, {
  width: '26.25rem',

  [`& ${SectionTitle}`]: {
    '&:first-child': {
      marginTop: 0,
    },
  },
});
const Btn = styled(Button, {
  marginBottom: '1rem',

  variants: {
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
});
const FormWrapper = styled(Box, {
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

export const ContractTransaction = ({ contract }: Props) => {
  const { accountId, modal, selector } = useWalletSelector(contract.address);
  const handleWalletSelect = useCallback(() => modal?.show(), [modal]);

  return (
    <Flex gap="l">
      <ContractParams>
        <SectionTitle>1. Account</SectionTitle>
        <Flex inline align="center">
          {accountId ? (
            <>
              <FeatherIcon icon="user" size="s" />
              <Text weight="semibold" color="text1">
                {accountId}
              </Text>
            </>
          ) : null}
          <Btn fullWidth={Boolean(!accountId)} color="primaryBorder" onClick={handleWalletSelect}>
            {!accountId ? 'Connect A Wallet' : 'Change Wallet'}
          </Btn>
        </Flex>

        <ContractTransactionForm accountId={accountId} contract={contract} selector={selector} />
      </ContractParams>
      <Box>
        <SendTransactionBanner />
      </Box>
    </Flex>
  );
};

interface ContractFormProps {
  accountId?: string;
  contract: Contract;
  selector: WalletSelector | null;
}

const ContractTransactionForm = ({ accountId, contract, selector }: ContractFormProps) => {
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

  const functionItems = contractMethods?.abi.body.functions;
  const selectedFunction = form.watch('contractFunction');
  const selectedFunctionParams = functionItems?.find((option) => option.name === selectedFunction);

  const submitForm = async (params: any) => {
    // Asserts that contract exists and selected function is valid
    const contractFn = contractMethods![selectedFunctionParams!.name];

    let call;

    if (selectedFunctionParams?.params) {
      const fieldParams = selectedFunctionParams.params.map((p) => {
        const value = params[p.name];
        if (p.type_schema.type === 'integer') {
          return parseInt(value);
        } else if (p.type_schema.type === 'string') {
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
      if (selectedFunctionParams?.params) {
        // TODO: fix call transaction
        res = await call.callFrom(await selector?.wallet(), {
          gas: params.gas,
          // TODO double check if this is where deposit is yoinked from
          attachedDeposit: params.deposit,
          // TODO might want to set this when testing the redirect flow (deposit sending txs)
          walletCallbackUrl: undefined,
          signer: accountId,
        });
      } else {
        res = await call.view();
      }
      console.log('tx output: ', res);
      openToast({
        type: 'success',
        title: 'Succeed!',
        description: typeof res === 'string' ? res : 'Try to make a call method to see the result',
      });
    } catch (e) {
      console.error(e);
      openToast({
        duration: Infinity,
        type: 'error',
        title: 'Error on sending transaction',
        description: `${e}`,
      });
    }
    return null;
  };

  return (
    // TODO should this be disabled if the contract is null? Seems like there can be a race
    // TODO condition if submitted before the contract is loaded through the async fn?
    <FormWrapper disabled={!signedIn(accountId, selector)}>
      <Form.Root disabled={!signedIn(accountId, selector)} onSubmit={form.handleSubmit(submitForm)}>
        <SectionTitle>2. Function</SectionTitle>
        <Flex stack>
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

                    <DropdownMenu.Content align="start">
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

          {selectedFunctionParams?.params
            ? selectedFunctionParams?.params.map((param) => (
                <Form.Group key={param.name}>
                  <Form.FloatingLabelInput
                    type={
                      param.type_schema?.type === 'integer'
                        ? 'number'
                        : param.type_schema?.type === 'string'
                        ? 'string'
                        : 'text'
                    }
                    label="Input Parameter"
                    isInvalid={!!form.formState.errors?.name}
                    {...form.register(`${param.name}`, {
                      required: 'Please enter input parameter',
                    })}
                  />
                  <Form.Feedback>{form.formState.errors.name?.message}</Form.Feedback>
                </Form.Group>
              ))
            : null}

          <Form.Group></Form.Group>
        </Flex>

        <SectionTitle>3. Transaction Parameters</SectionTitle>
        <Flex stack gap="l">
          <Form.Group>
            <Form.FloatingLabelInput
              type="string"
              label="Gas"
              isInvalid={!!form.formState.errors.gas}
              {...form.register('gas', {
                // TODO this should not be required. Should be a reasonable default, and maybe a
                // max gas option?
                required: 'Please enter input parameter',
              })}
            />
            <Form.Feedback>{form.formState.errors.gas?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.FloatingLabelInput
              type="string"
              label="Deposit"
              isInvalid={!!form.formState.errors.deposit}
              {...form.register('deposit', {
                // TODO this shouldn't be required. Should default to 0
                required: 'Please enter input parameter',
              })}
            />
            <Form.Feedback>{form.formState.errors.deposit?.message}</Form.Feedback>
          </Form.Group>

          <Btn type="submit" loading={form.formState.isSubmitting} fullWidth>
            Send Transaction
          </Btn>
        </Flex>
      </Form.Root>
    </FormWrapper>
  );
};

const SendTransactionBanner = () => (
  <Card padding="xl">
    <Flex>
      <Box>
        <SvgIcon size="xl" color="success" icon={TxList} />
      </Box>
      <Box>
        <Heading>Sending a Transaction</Heading>
        <ListWrapper as="ol">
          <ListItem>Connect Wallet</ListItem>
          <ListItem>Select Function</ListItem>
          <ListItem>Input function parameters</ListItem>
          <ListItem>Send transaction</ListItem>
        </ListWrapper>
      </Box>
    </Flex>
    <TextItalic>The transaction execution and history will show up here</TextItalic>
  </Card>
);
