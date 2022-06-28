import { useCombobox } from 'downshift';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import * as Combobox from '@/components/lib/Combobox';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H3, H4 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useContracts } from '@/hooks/contracts';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import { DestinationsSelector } from '@/modules/alerts/components/DestinationsSelector';
import { createAlert, useAlerts } from '@/modules/alerts/hooks/alerts';
import { alertTypeOptions, amountComparatorOptions } from '@/modules/alerts/utils/constants';
import type { AlertType, AmountComparator } from '@/modules/alerts/utils/types';
import { NewAlert } from '@/modules/alerts/utils/types';
import { formRegex } from '@/utils/constants';
import { assertUnreachable } from '@/utils/helpers';
import { mergeInputProps } from '@/utils/merge-input-props';
import type { Contract, Environment, NextPageWithLayout, Project } from '@/utils/types';

interface FormData {
  contract: string;
  type: AlertType;
  acctBalRule?: {
    amount: number;
    comparator: AmountComparator;
  };
  eventRule?: {
    standard: string;
    version: string;
    event: string;
  };
  fnCallRule?: {
    function: string;
  };
}

const NewAlert: NextPageWithLayout = () => {
  const router = useRouter();
  const form = useForm<FormData>();
  const { project, environment } = useSelectedProject();
  const { mutate } = useAlerts(project?.slug, environment?.subId);
  const [createError, setCreateError] = useState('');
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<number[]>([]);
  const { contracts } = useContracts(project?.slug, environment?.subId);
  const [contractComboboxItems, setContractComboboxItems] = useState<Contract[]>([]);

  useEffect(() => {
    if (contracts) {
      setContractComboboxItems(contracts);
    }
  }, [contracts]);

  const contractCombobox = useCombobox({
    id: 'contract-cbx',
    items: contractComboboxItems,
    itemToString(item) {
      return item ? item.address : '';
    },
    onInputValueChange({ inputValue }) {
      const query = inputValue?.toLowerCase().trim();
      const filtered = contracts?.filter((item) => !query || item.address.toLowerCase().includes(query));
      setContractComboboxItems(filtered || []);
    },
    onSelectedItemChange() {
      form.clearErrors('contract');
    },
  });

  const selectedAlertType = form.watch('type');

  async function submitForm(data: FormData) {
    try {
      const body = returnNewAlertBody(data, selectedDestinationIds, project, environment);
      const alert = await createAlert(body);

      mutate((alerts) => {
        return [...(alerts || []), alert];
      });

      openToast({
        type: 'success',
        title: 'Alert was created.',
      });

      await router.push('/alerts');
    } catch (e: any) {
      console.error('Failed to create alert', e);
      setCreateError('Failed to create alert.');
    }
  }

  return (
    <Section>
      <Flex gap="l" stack={{ '@laptop': true }}>
        <Flex
          stack
          css={{
            width: '100%',
            maxWidth: 'var(--size-max-container-width-xs)',
            '@laptop': {
              maxWidth: '100%',
            },
          }}
        >
          <Flex align="center">
            <FeatherIcon icon="bell" size="m" />
            <H3 as="h1">New Alert</H3>
          </Flex>

          <Text>Configure a new alert to be notified when certain conditions occur on a specific contract.</Text>

          <Link href="/alerts" passHref>
            <TextLink>
              <FeatherIcon icon="arrow-left" />
              Alerts
            </TextLink>
          </Link>
        </Flex>

        <Form.Root disabled={form.formState.isSubmitting} onSubmit={form.handleSubmit(submitForm)}>
          <Flex stack gap="l">
            <Flex stack>
              <H4>
                <Text as="span" color="text3" size="h4" family="number">
                  1.
                </Text>{' '}
                Select Target
              </H4>

              <Text>
                <Flex as="span" align="center" gap="s" wrap>
                  Valid address examples: <Badge size="s">pagoda.near</Badge>
                  <Badge size="s">app.pagoda.testnet</Badge>
                  <Badge size="s">*.pagoda.near</Badge>
                </Flex>
              </Text>

              <Form.Group>
                <Combobox.Root open={contractCombobox.isOpen && contractComboboxItems.length > 0}>
                  <Combobox.Box {...contractCombobox.getComboboxProps()}>
                    <Form.FloatingLabelInput
                      label="Address"
                      labelProps={{ ...contractCombobox.getLabelProps() }}
                      isInvalid={!!form.formState.errors.contract}
                      placeholder="Enter any address..."
                      {...mergeInputProps(
                        contractCombobox.getInputProps({
                          onFocus: () => !contractCombobox.isOpen && contractCombobox.openMenu(),
                        }),
                        form.register('contract', {
                          required: 'Please enter an address',
                          pattern: {
                            value: formRegex.contractAddressWildcard,
                            message: 'Invalid address format. Please refer to valid examples above.',
                          },
                        }),
                      )}
                    />
                  </Combobox.Box>

                  <Combobox.Menu {...contractCombobox.getMenuProps()}>
                    <Combobox.MenuLabel>
                      <FeatherIcon icon="zap" size="xs" color="primary" /> Suggestions:
                    </Combobox.MenuLabel>

                    {contractComboboxItems.map((item, index) => (
                      <Combobox.MenuItem {...contractCombobox.getItemProps({ item, index })} key={item.address}>
                        {item.address}
                      </Combobox.MenuItem>
                    ))}
                  </Combobox.Menu>
                </Combobox.Root>

                <Form.Feedback>{form.formState.errors.contract?.message}</Form.Feedback>
              </Form.Group>

              <datalist id="contractsDatalist">
                {contracts?.map((c) => {
                  return <option value={c.address} key={c.id} />;
                })}
              </datalist>
            </Flex>

            <HR />

            <Flex stack>
              <H4>
                <Text as="span" color="text3" size="h4" family="number">
                  2.
                </Text>{' '}
                Select Condition
              </H4>

              <Controller
                name="type"
                control={form.control}
                rules={{
                  required: 'Please select a condition',
                }}
                render={({ field }) => {
                  const selection = alertTypeOptions.find((a) => a.value === field.value);

                  return (
                    <Form.Group>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <Form.FloatingLabelSelect
                            label="Condition"
                            isInvalid={!!form.formState.errors.type}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            selection={
                              selection && (
                                <>
                                  <FeatherIcon icon={selection.icon} color="primary" size="xs" />
                                  {selection.name}
                                </>
                              )
                            }
                          />
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content width="trigger">
                          <DropdownMenu.RadioGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                            {alertTypeOptions.map((option) => (
                              <DropdownMenu.RadioItem
                                indicator={<FeatherIcon icon={option.icon} />}
                                value={option.value}
                                key={option.value}
                              >
                                <Flex stack gap="none">
                                  {option.name}
                                  <Text size="bodySmall">{option.description}</Text>
                                </Flex>
                              </DropdownMenu.RadioItem>
                            ))}
                          </DropdownMenu.RadioGroup>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>

                      <Form.Feedback>{form.formState.errors.type?.message}</Form.Feedback>
                    </Form.Group>
                  );
                }}
              />

              {(selectedAlertType === 'ACCT_BAL_NUM' || selectedAlertType === 'ACCT_BAL_PCT') && (
                <>
                  <Flex>
                    <Controller
                      name="acctBalRule.comparator"
                      control={form.control}
                      rules={{
                        required: 'Please select a comparator',
                      }}
                      render={({ field }) => {
                        const selection = amountComparatorOptions.find((a) => a.value === field.value);

                        return (
                          <Form.Group>
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <Form.FloatingLabelSelect
                                  label="Comparator"
                                  isInvalid={!!form.formState.errors.acctBalRule?.comparator}
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                  selection={selection?.name}
                                />
                              </DropdownMenu.Trigger>

                              <DropdownMenu.Content align="start">
                                <DropdownMenu.RadioGroup
                                  value={field.value}
                                  onValueChange={(value) => field.onChange(value)}
                                >
                                  {amountComparatorOptions.map((option) => (
                                    <DropdownMenu.RadioItem
                                      indicator={
                                        <Text color="current" css={{ width: '1.5rem', textAlign: 'center' }}>
                                          {option.icon}
                                        </Text>
                                      }
                                      value={option.value}
                                      key={option.value}
                                    >
                                      {option.name}
                                    </DropdownMenu.RadioItem>
                                  ))}
                                </DropdownMenu.RadioGroup>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>

                            <Form.Feedback>{form.formState.errors.type?.message}</Form.Feedback>
                          </Form.Group>
                        );
                      }}
                    />

                    <Form.Group>
                      <Form.FloatingLabelInput
                        label={selectedAlertType === 'ACCT_BAL_PCT' ? 'Amount (%)' : 'Amount'}
                        type="number"
                        isInvalid={!!form.formState.errors.acctBalRule?.amount}
                        {...form.register('acctBalRule.amount', {
                          valueAsNumber: true,
                          required: 'Please enter an amount',
                        })}
                      />
                      <Form.Feedback>{form.formState.errors.acctBalRule?.amount?.message}</Form.Feedback>
                    </Form.Group>
                  </Flex>
                </>
              )}

              {selectedAlertType === 'EVENT' && (
                <>
                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Event Name"
                      isInvalid={!!form.formState.errors.eventRule?.event}
                      {...form.register('eventRule.event', {
                        required: 'Please enter an event name',
                      })}
                    />
                    <Form.Feedback>{form.formState.errors.eventRule?.event?.message}</Form.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Standard"
                      isInvalid={!!form.formState.errors.eventRule?.standard}
                      {...form.register('eventRule.standard', {
                        required: 'Please enter a standard',
                      })}
                    />
                    <Form.Feedback>{form.formState.errors.eventRule?.standard?.message}</Form.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Version"
                      isInvalid={!!form.formState.errors.eventRule?.version}
                      {...form.register('eventRule.version', {
                        required: 'Please enter a version',
                      })}
                    />
                    <Form.Feedback>{form.formState.errors.eventRule?.version?.message}</Form.Feedback>
                  </Form.Group>
                </>
              )}

              {selectedAlertType === 'FN_CALL' && (
                <>
                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Function Name"
                      isInvalid={!!form.formState.errors.fnCallRule?.function}
                      {...form.register('fnCallRule.function', {
                        required: 'Please enter a function name',
                      })}
                    />
                    <Form.Feedback>{form.formState.errors.fnCallRule?.function?.message}</Form.Feedback>
                  </Form.Group>
                </>
              )}
            </Flex>

            <HR />

            <Flex stack>
              <H4>
                <Text as="span" color="text3" size="h4" family="number">
                  3.
                </Text>{' '}
                Select Destinations
              </H4>

              <DestinationsSelector
                debounce={false}
                selectedIds={selectedDestinationIds}
                setSelectedIds={setSelectedDestinationIds}
              />
            </Flex>

            <HR />

            <Flex justify="spaceBetween" align="center">
              <Button type="submit" loading={form.formState.isSubmitting}>
                <FeatherIcon icon="bell" /> Create Alert
              </Button>

              <Link href="/alerts" passHref>
                <TextLink color="neutral">Cancel</TextLink>
              </Link>
            </Flex>
          </Flex>
        </Form.Root>
      </Flex>

      <ErrorModal error={createError} setError={setCreateError} />
    </Section>
  );
};

NewAlert.getLayout = wrapDashboardLayoutWithOptions({
  redirect: {
    environmentChange: true,
    projectChange: true,
    url: '/alerts',
  },
});

function returnNewAlertBody(
  data: FormData,
  destinations: number[],
  project?: Project,
  environment?: Environment,
): NewAlert {
  if (!project || !environment) throw new Error('No project or environment selected.');

  const base = {
    destinations,
    environmentSubId: environment.subId,
    projectSlug: project.slug,
  };

  switch (data.type) {
    case 'ACCT_BAL_NUM':
      return {
        ...base,
        type: 'ACCT_BAL_NUM',
        rule: {
          contract: data.contract,
          ...data.acctBalRule!,
        },
      };
    case 'ACCT_BAL_PCT':
      return {
        ...base,
        type: 'ACCT_BAL_PCT',
        rule: {
          contract: data.contract,
          ...data.acctBalRule!,
        },
      };
    case 'EVENT':
      return {
        ...base,
        type: 'EVENT',
        rule: {
          contract: data.contract,
          ...data.eventRule!,
        },
      };
    case 'FN_CALL':
      return {
        ...base,
        type: 'FN_CALL',
        rule: {
          contract: data.contract,
          ...data.fnCallRule!,
        },
      };
    case 'TX_FAILURE':
      return {
        ...base,
        type: 'TX_FAILURE',
        rule: {
          contract: data.contract,
        },
      };
    case 'TX_SUCCESS':
      return {
        ...base,
        type: 'TX_SUCCESS',
        rule: {
          contract: data.contract,
        },
      };
    default:
      assertUnreachable(data.type);
  }
}

export default NewAlert;
