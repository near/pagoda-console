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
import { Info } from '@/components/lib/Info';
import { NearInput } from '@/components/lib/NearInput';
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
import { convertNearToYocto } from '@/utils/convert-near';
import { assertUnreachable } from '@/utils/helpers';
import { numberInputHandler } from '@/utils/input-handlers';
import { mergeInputProps } from '@/utils/merge-input-props';
import { sanitizeNumber } from '@/utils/sanitize-number';
import type { Contract, Environment, NextPageWithLayout, Project } from '@/utils/types';
import { validateMaxNearDecimalLength, validateMaxNearU128 } from '@/utils/validations';

interface FormData {
  contract: string;
  type: AlertType;
  acctBalRule?: {
    comparator: AmountComparator;
  };
  acctBalNumRule?: {
    from: string;
    to: string;
  };
  acctBalPctRule?: {
    from: string;
    to: string;
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

  const acctBalRuleComparator = form.watch('acctBalRule.comparator');
  const acctBalNumRuleFrom = form.watch('acctBalNumRule.from');
  const acctBalPctRuleFrom = form.watch('acctBalPctRule.from');

  useEffect(() => {
    if (contracts) {
      setContractComboboxItems(contracts);
    }
  }, [contracts]);

  const environmentTitle = environment?.net === 'TESTNET' ? 'Testnet' : 'Mainnet';
  const environmentTla = environment?.net === 'TESTNET' ? 'testnet' : 'near';

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
      if (e.message === 'ADDRESS_NOT_FOUND') {
        const net = environmentTitle.toLowerCase();
        setCreateError(`Address ${data.contract} was not found on ${net}.`);
        return;
      }

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
                Select {environmentTitle} Target
              </H4>

              <Text>
                <Flex as="span" align="center" gap="s" wrap>
                  Valid address examples: <Badge size="s">pagoda.{environmentTla}</Badge>
                  <Badge size="s">app.pagoda.{environmentTla}</Badge>
                  <Badge size="s">*.pagoda.{environmentTla}</Badge>
                  <Info content={`The wildcard character(*) can be used to match against multiple subaccounts.`} />
                </Flex>
              </Text>

              <Form.Group>
                <Combobox.Root open={contractCombobox.isOpen && contractComboboxItems.length > 0}>
                  <Combobox.Box {...contractCombobox.getComboboxProps()}>
                    <Form.FloatingLabelInput
                      label={`${environmentTitle} Address`}
                      labelProps={{ ...contractCombobox.getLabelProps() }}
                      isInvalid={!!form.formState.errors.contract}
                      placeholder="Enter any address..."
                      {...mergeInputProps(
                        contractCombobox.getInputProps({
                          onFocus: () => !contractCombobox.isOpen && contractCombobox.openMenu(),
                        }),
                        form.register('contract', {
                          required: 'Please enter an address',
                          minLength: {
                            value: 2,
                            message: 'Address must be at least 2 characters',
                          },
                          maxLength: {
                            value: 64,
                            message: 'Address must be 64 characters or less',
                          },
                          pattern: {
                            value: formRegex.contractAddressWildcard,
                            message:
                              'Invalid address format. Please refer to valid examples above. Note that wildcards are only allowed on subaccounts.',
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

                          <Form.Feedback>{form.formState.errors.acctBalRule?.comparator?.message}</Form.Feedback>
                        </Form.Group>
                      );
                    }}
                  />

                  {selectedAlertType === 'ACCT_BAL_NUM' && acctBalRuleComparator && (
                    <>
                      <Form.Group>
                        <Controller
                          name="acctBalNumRule.from"
                          control={form.control}
                          rules={{
                            required: 'Please enter an amount',
                            validate: {
                              maxDecimals: validateMaxNearDecimalLength,
                              maxValue: validateMaxNearU128,
                            },
                          }}
                          render={({ field }) => (
                            <NearInput
                              label={acctBalRuleComparator === 'RANGE' ? 'From Amount' : 'Amount'}
                              placeholder="eg: 1.5"
                              field={field}
                              isInvalid={!!form.formState.errors.acctBalNumRule?.from}
                              onInput={() => form.clearErrors('acctBalNumRule.to')}
                            />
                          )}
                        />

                        <Form.Feedback>{form.formState.errors.acctBalNumRule?.from?.message}</Form.Feedback>
                      </Form.Group>

                      {acctBalRuleComparator === 'RANGE' && (
                        <Form.Group>
                          <Controller
                            name="acctBalNumRule.to"
                            control={form.control}
                            rules={{
                              required: 'Please enter an amount',
                              validate: {
                                maxDecimals: validateMaxNearDecimalLength,
                                maxValue: validateMaxNearU128,
                                minValue: (value) =>
                                  Number(value) > Number(acctBalNumRuleFrom) || 'Must be greater than "From Amount"',
                              },
                            }}
                            render={({ field }) => (
                              <NearInput
                                label="To Amount"
                                placeholder="eg: 3"
                                field={field}
                                isInvalid={!!form.formState.errors.acctBalNumRule?.to}
                              />
                            )}
                          />

                          <Form.Feedback>{form.formState.errors.acctBalNumRule?.to?.message}</Form.Feedback>
                        </Form.Group>
                      )}
                    </>
                  )}

                  {selectedAlertType === 'ACCT_BAL_PCT' && acctBalRuleComparator && (
                    <Flex>
                      <Form.Group>
                        <Form.FloatingLabelInput
                          label={(acctBalRuleComparator === 'RANGE' ? 'From Percentage' : 'Percentage') + ' %'}
                          placeholder="eg: 30"
                          isInvalid={!!form.formState.errors.acctBalPctRule?.from}
                          isNumber
                          onInput={(event) => {
                            numberInputHandler(event);
                            form.clearErrors('acctBalPctRule.to');
                          }}
                          {...form.register('acctBalPctRule.from', {
                            setValueAs: (value) => sanitizeNumber(value),
                            required: 'Please enter a percentage',
                            validate: {
                              maxValue: (value) => Number(value) <= 100 || 'Must be 100 or less',
                            },
                          })}
                        />

                        <Form.Feedback>{form.formState.errors.acctBalPctRule?.from?.message}</Form.Feedback>
                      </Form.Group>

                      {acctBalRuleComparator === 'RANGE' && (
                        <Form.Group>
                          <Form.FloatingLabelInput
                            label="To Percentage %"
                            placeholder="eg: 60"
                            isInvalid={!!form.formState.errors.acctBalPctRule?.to}
                            isNumber
                            onInput={numberInputHandler}
                            {...form.register('acctBalPctRule.to', {
                              setValueAs: (value) => sanitizeNumber(value),
                              required: 'Please enter a percentage',
                              validate: {
                                minValue: (value) =>
                                  Number(value) > Number(acctBalPctRuleFrom) ||
                                  'Must be greater than "From Percentage"',
                                maxValue: (value) => Number(value) <= 100 || 'Must be 100 or less',
                              },
                            })}
                          />

                          <Form.Feedback>{form.formState.errors.acctBalPctRule?.to?.message}</Form.Feedback>
                        </Form.Group>
                      )}
                    </Flex>
                  )}
                </>
              )}

              {selectedAlertType === 'EVENT' && (
                <>
                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Event Name"
                      placeholder="eg: nft_buy, nft_*"
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
                      placeholder="eg: nep171, nep*"
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
                      placeholder="eg: 1.0.2, 1.0.*"
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
      if (!data.acctBalRule || !data.acctBalNumRule) throw new Error('Invalid form data for ACCT_BAL_NUM');

      return {
        ...base,
        type: 'ACCT_BAL_NUM',
        rule: {
          contract: data.contract,
          ...returnAcctBalNumBody(data.acctBalRule.comparator, data.acctBalNumRule),
        },
      };
    case 'ACCT_BAL_PCT':
      if (!data.acctBalRule || !data.acctBalPctRule) throw new Error('Invalid form data for ACCT_BAL_PCT');

      return {
        ...base,
        type: 'ACCT_BAL_PCT',
        rule: {
          contract: data.contract,
          ...returnAcctBalBody(data.acctBalRule.comparator, data.acctBalPctRule),
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

function returnAcctBalNumBody(comparator: AmountComparator, { from, to }: { from: string; to: string }) {
  from = convertNearToYocto(from);
  to = convertNearToYocto(to);
  return returnAcctBalBody(comparator, { from, to });
}

function returnAcctBalBody(comparator: AmountComparator, { from, to }: { from: string; to: string }) {
  switch (comparator) {
    case 'EQ':
      return {
        from,
        to: from,
      };
    case 'GTE':
      return {
        from,
        to: null,
      };
    case 'LTE':
      return {
        from: null,
        to: from,
      };
    case 'RANGE':
      return {
        from,
        to,
      };
    default:
      assertUnreachable(comparator);
  }
}

export default NewAlert;
