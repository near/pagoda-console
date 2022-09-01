import BN from 'bn.js';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';

import TransactionAction from '@/components/explorer/transactions/TransactionAction';
import { NetContext } from '@/components/explorer/utils/NetContext';
import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1, H2 } from '@/components/lib/Heading';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { TruncateMiddle } from '@/components/lib/TruncateMiddle';
import { useContracts } from '@/hooks/contracts';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import { useIdentity } from '@/hooks/user';
import { useRecentTransactions } from '@/modules/core/hooks/recent-transactions';
import ContractsPreview from '@/public/contractsPreview.png';
import analytics from '@/utils/analytics';
import config from '@/utils/config';
import { formRegex } from '@/utils/constants';
import { formatBytes } from '@/utils/format-bytes';
import { authenticatedPost } from '@/utils/http';
import type { NetOption } from '@/utils/types';
import type { FinalityStatus } from '@/utils/types';
import type { Contract, Environment } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

const Contracts: NextPageWithLayout = () => {
  const { project, environment } = useSelectedProject();
  const user = useIdentity();

  if (!user || !project || !environment) {
    return <Spinner center />;
  }

  // TODO (NTH) lean into automatic static optimization and rework checks so that the
  // maximum amount of elements can be rendered without environmentId
  return <ContractsTable project={project.slug} environment={environment} />;
};

function ContractsTable(props: { project: string; environment: Environment }) {
  const { contracts, error, mutate: mutateContracts } = useContracts(props.project, props.environment.subId);
  // TODO determine how to not retry on 400s
  const [isEditing, setIsEditing] = useState(false);

  // these variables might seem redundant, but there are three states we need
  // to represent
  // 1. there are contracts being tracked
  // 2. there are no contracts being tracked
  // 3. we do not yet know if there are contracts being tracked
  //
  // instead of representing this with true/false/null and potentially
  // slipping up on a falsy check where false and null are mixed up, let's
  // check truthiness on these two
  const hasNoContracts = Boolean(contracts && !contracts.length);
  const hasContracts = Boolean(contracts && contracts.length);

  useEffect(() => {
    if (hasNoContracts) {
      setIsEditing(false);
    }
  }, [hasNoContracts]);

  if (hasNoContracts) {
    return (
      <ContractsEmptyState project={props.project} environment={props.environment} mutateContracts={mutateContracts} />
    );
  }

  if (!contracts && !error) {
    return <Spinner center />;
  }

  if (error) {
    return (
      <Section>
        <Message type="error" content={error.message} />
      </Section>
    );
  }

  return (
    <>
      <Section>
        <Flex stack gap="l">
          <Flex justify="spaceBetween">
            <H1>Contracts</H1>
            {hasContracts && <Button onClick={() => setIsEditing(!isEditing)}>{!isEditing ? 'Edit' : 'Done'}</Button>}
          </Flex>

          {hasContracts && (
            <Box
              css={{
                width: '100%',
                display: 'grid',
                rowGap: 'var(--space-m)',
                columnGap: 'var(--space-l)',
                alignItems: 'center',
                gridTemplateColumns: `1fr 10rem 10rem ${isEditing ? ' auto' : ''}`,
                textAlign: 'right',
              }}
            >
              <span />
              <Text color="text1" weight="semibold" as="span">
                Account Balance
              </Text>
              <Text color="text1" weight="semibold" as="span">
                Storage Used
              </Text>
              {isEditing && <span></span>}
              {contracts &&
                contracts.map((contract) => (
                  <ContractRow
                    key={contract.address}
                    contract={contract}
                    showDelete={isEditing}
                    onDelete={mutateContracts}
                  />
                ))}
            </Box>
          )}

          <AddContractForm project={props.project} environment={props.environment} onAdd={mutateContracts} />
        </Flex>
      </Section>

      {hasContracts && <RecentTransactionList contracts={contracts!} net={props.environment.net} />}
    </>
  );
}

function ContractsEmptyState({
  project,
  environment,
  mutateContracts,
}: {
  project: string;
  environment: Environment;
  mutateContracts: () => void;
}) {
  return (
    <Section>
      <Container size="m">
        <Flex gap="l" align="center">
          <Box css={{ width: '50%' }}>
            <Image src={ContractsPreview} alt="Preview of populated contracts page" />
          </Box>

          <Flex css={{ width: '50%' }} stack>
            <Text>
              <Text color="text1" weight="semibold" as="span">
                To see focused explorer views and aggregate transactions:
              </Text>{' '}
              add contracts to this project.{' '}
            </Text>

            <AddContractForm project={project} environment={environment} onAdd={mutateContracts} />
          </Flex>
        </Flex>
      </Container>
    </Section>
  );
}

interface AddContractFormData {
  contractAddress: string;
}

function AddContractForm(props: { project: string; environment: Environment; onAdd: () => void }) {
  const { register, handleSubmit, formState, setValue } = useForm<AddContractFormData>();
  const [showAddForm, setShowAddForm] = useState(false);

  function closeAddForm() {
    setValue('contractAddress', '');
    setShowAddForm(false);
  }

  const submitNewContract: SubmitHandler<AddContractFormData> = async ({ contractAddress }) => {
    try {
      const contract = await authenticatedPost('/projects/addContract', {
        project: props.project,
        environment: props.environment.subId,
        address: contractAddress,
      });
      analytics.track('DC Add Contract', {
        status: 'success',
        contractId: contractAddress,
        net: props.environment.subId === 2 ? 'MAINNET' : 'TESTNET',
      });
      props.onAdd();
      closeAddForm();
      return contract;
    } catch (e: any) {
      if (e.message === 'ADDRESS_NOT_FOUND') {
        const net = props.environment.net.toLowerCase();
        openToast({
          type: 'error',
          title: 'Contract not found',
          description: `Contract ${contractAddress} was not found on ${net}.`,
        });
        return;
      }

      if (e.message === 'DUPLICATE_CONTRACT_ADDRESS') {
        openToast({
          type: 'error',
          title: 'Duplicate Contract',
          description: 'This contract has already been saved to your project.',
        });
      } else {
        analytics.track('DC Add Contract', {
          status: 'failure',
          error: e.message,
          contractId: contractAddress,
          net: props.environment.subId === 2 ? 'MAINNET' : 'TESTNET',
        });

        openToast({
          type: 'error',
          title: 'Failed to add contract.',
        });
      }
    }
  };

  return (
    <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitNewContract)}>
      <Flex stack>
        {showAddForm && (
          <Form.Group maxWidth="m">
            <Form.Input
              isInvalid={!!formState.errors.contractAddress}
              placeholder={props.environment.net === 'MAINNET' ? 'contract.near' : 'contract.testnet'}
              {...register('contractAddress', {
                required: 'Address field is required',
                minLength: {
                  value: 2,
                  message: 'Address must be at least 2 characters',
                },
                maxLength: {
                  value: 64,
                  message: 'Address must be 64 characters or less',
                },
                pattern: {
                  value: formRegex.contractAddress,
                  message: 'Invalid address format.',
                },
              })}
            />
            <Form.Feedback>{formState.errors.contractAddress?.message}</Form.Feedback>
          </Form.Group>
        )}

        <Flex>
          {showAddForm && (
            <>
              <Button type="submit" loading={formState.isSubmitting}>
                Confirm
              </Button>
              <Button onClick={closeAddForm} color="neutral">
                Cancel
              </Button>
            </>
          )}
          {!showAddForm && <Button onClick={() => setShowAddForm(true)}>Add a Contract</Button>}
        </Flex>
      </Flex>
    </Form.Root>
  );
}

function ContractRow(props: { contract: Contract; showDelete: boolean; onDelete: () => void }) {
  const [canDelete, setCanDelete] = useState(true);
  const { data, error } = useSWR(
    [props.contract.address, props.contract.net],
    async (address) => {
      const res = await fetch(config.url.rpc.default[props.contract.net], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: address,
          },
        }),
      }).then((res) => res.json());
      if (res.error) {
        // TODO decide whether to retry error
        throw new Error(res.error.name);
      }
      return res;
    },
    {
      // TODO decide whether to retry error
      shouldRetryOnError: false,
    },
  );

  async function removeContract() {
    setCanDelete(false);

    try {
      await authenticatedPost('/projects/removeContract', {
        slug: props.contract.slug,
      });
      analytics.track('DC Remove Contract', {
        status: 'success',
        contractId: props.contract.address,
      });
      props.onDelete && props.onDelete();
    } catch (e: any) {
      analytics.track('DC Remove Contract', {
        status: 'failure',
        contractId: props.contract.address,
        error: e.message,
      });
      // TODO
      console.error(e);
      setCanDelete(true);
    }
  }

  return (
    <>
      <Box css={{ textAlign: 'left', minWidth: 0 }}>
        <TextLink
          css={{ maxWidth: '100%' }}
          color="neutral"
          onClick={() => analytics.track('DC View contract in Explorer')} // TODO CHECK
          href={`https://explorer${props.contract.net === 'TESTNET' ? '.testnet' : ''}.near.org/accounts/${
            props.contract.address
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TruncateMiddle value={props.contract.address} prefix={30} prefixLaptop={10} prefixTablet={5} suffix={10} />
        </TextLink>
      </Box>

      {data ? (
        <Text family="number">{(data.result.amount / 10 ** 24).toFixed(5)} Ⓝ</Text>
      ) : !error ? (
        <Spinner size="xs" />
      ) : (
        <Text family="number">N/A</Text>
      )}

      {data ? (
        <Text family="number">{formatBytes(data.result.storage_usage)}</Text>
      ) : !error ? (
        <Spinner size="xs" />
      ) : (
        <Text family="number">N/A</Text>
      )}

      {props.showDelete && (
        <Button size="s" color="danger" onClick={removeContract} disabled={!canDelete}>
          <FeatherIcon icon="trash-2" size="xs" />
        </Button>
      )}
    </>
  );
}

function RecentTransactionList({ contracts, net }: { contracts: Contract[]; net: NetOption }) {
  const [finalityStatus, setFinalityStatus] = useState<FinalityStatus>();
  const { transactions } = useRecentTransactions(
    contracts.map((c) => c.address),
    net,
  );

  // fetch finality
  useEffect(() => {
    // TODO convert finality fetch to SWR, possibly even with polling, to make data more realtime
    fetchFinality(net);
  }, [net]);

  async function fetchFinality(net: NetOption) {
    const res = await fetch(config.url.rpc.default[net], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'block',
        params: {
          finality: 'final',
        },
      }),
    }).then((res) => res.json());
    if (res.error) {
      // TODO decide whether to retry error
      throw new Error(res.error.name);
    }
    const finalBlock = res.result;
    const newStatus = {
      finalBlockTimestampNanosecond: new BN(finalBlock.header.timestamp_nanosec),
      finalBlockHeight: finalBlock.header.height,
    };
    // debugger;
    setFinalityStatus(newStatus);
  }

  return (
    <Section>
      <Flex stack>
        <H2>Recent Transactions</H2>

        {!transactions && <Spinner center />}

        <NetContext.Provider value={net}>
          <Box css={{ width: '100%' }}>
            {transactions &&
              transactions.map((t) => {
                return (
                  <Flex key={t.hash}>
                    <Box css={{ flexGrow: 1 }}>
                      <TransactionAction transaction={t} net={net} finalityStatus={finalityStatus} />
                    </Box>

                    <Text
                      css={{
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        color: 'var(--color-text-2)',
                        paddingLeft: 'var(--space-m)',
                      }}
                    >
                      {t.sourceContract}
                    </Text>
                  </Flex>
                );
              })}
          </Box>
        </NetContext.Provider>
      </Flex>
    </Section>
  );
}

Contracts.getLayout = useDashboardLayout;

export default Contracts;
