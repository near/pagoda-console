import type { Alerts } from '@pc/common/types/alerts';
import type { Api } from '@pc/common/types/api';
import { useCombobox } from 'downshift';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
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
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import { useQuery } from '@/hooks/query';
import { useSelectedProject } from '@/hooks/selected-project';
import { DestinationsSelector } from '@/modules/alerts/components/DestinationsSelector';
import { useAlerts } from '@/modules/alerts/hooks/alerts';
import { alertTypeOptions, amountComparatorOptions } from '@/modules/alerts/utils/constants';
import { formRegex } from '@/utils/constants';
import { convertNearToYocto } from '@/utils/convert-near';
import { assertUnreachable } from '@/utils/helpers';
import { numberInputHandler } from '@/utils/input-handlers';
import { mergeInputProps } from '@/utils/merge-input-props';
import { sanitizeNumber } from '@/utils/sanitize-number';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';
import { validateMaxNearDecimalLength, validateMaxNearU128 } from '@/utils/validations';

interface FormData {
  contract: string;
  type: Alerts.RuleType;
  acctBalRule?: {
    comparator: Alerts.Comparator;
  };
  acctBalNumRule?: {
    from: string;
    to: string;
  };
  acctBalPctRule?: {
    from: number;
    to: number;
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

type Contracts = Api.Query.Output<'/projects/getContracts'>;
type Project = Api.Query.Output<'/projects/getDetails'>;
type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

const NewAlert: NextPageWithLayout = () => {
  const router = useRouter();
  const form = useForm<FormData>();
  const { project, environment } = useSelectedProject();
  const { mutate } = useAlerts(project?.slug, environment?.subId);
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<Alerts.DestinationId[]>([]);
  const contractsQuery = useQuery(
    ['/projects/getContracts', { project: project?.slug ?? 'unknown', environment: environment?.subId ?? -1 }],
    {
      onSuccess: (data) => setContractComboboxItems(data),
      enabled: Boolean(project && environment),
    },
  );
  const [contractComboboxItems, setContractComboboxItems] = useState<Contracts>([]);

  const acctBalRuleComparator = form.watch('acctBalRule.comparator');
  const acctBalNumRuleFrom = form.watch('acctBalNumRule.from');
  const acctBalPctRuleFrom = form.watch('acctBalPctRule.from');

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
      const filtered = contractsQuery.data?.filter((item) => !query || item.address.toLowerCase().includes(query));
      setContractComboboxItems(filtered || []);
    },
    onSelectedItemChange() {
      form.clearErrors('contract');
    },
  });

  const selectedAlertType = form.watch('type');

  const createAlertMutation = useMutation('/alerts/createAlert', {
    onSuccess: (result) => {
      mutate((alerts) => alerts && [...alerts, result]);
      openToast({
        type: 'success',
        title: 'Alert was created.',
      });
      router.push('/alerts');
    },
    getAnalyticsSuccessData: (_variables, result) => ({
      name: result.name,
      id: result.id,
    }),
  });
  const submitForm = useCallback(
    (data: FormData) => {
      if (!project || !environment) {
        return;
      }
      createAlertMutation.mutate(returnNewAlertBody(data, selectedDestinationIds, project, environment));
    },
    [createAlertMutation, project, environment, selectedDestinationIds],
  );
  const createAlertError = useMemo(() => {
    if (createAlertMutation.error === undefined) {
      return;
    }
    if ((createAlertMutation.error as any).message === 'ADDRESS_NOT_FOUND') {
      return `Address ${form.getValues('contract')} was not found on ${environmentTitle.toLowerCase()}.`;
    }
    return 'Failed to create alert';
  }, [createAlertMutation.error, form, environmentTitle]);

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
            <TextLink stableId={StableId.NEW_ALERT_BACK_TO_ALERTS_LINK}>
              <FeatherIcon icon="arrow-left" />
              Alerts
            </TextLink>
          </Link>
        </Flex>

        <Form.Root disabled={createAlertMutation.isLoading} onSubmit={form.handleSubmit(submitForm)}>
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
                      stableId={StableId.NEW_ALERT_ADDRESS_INPUT}
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
                {contractsQuery.data?.map((c) => {
                  return <option value={c.address} key={c.slug} />;
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

              <Text>
                Not finding the alert condition you need? Leave a feature suggestion using the widget in the lower-right
                corner.
              </Text>

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
                            stableId={StableId.NEW_ALERT_CONDITION_SELECT}
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
                                stableId={StableId.NEW_ALERT_COMPARATOR_SELECT}
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
                              stableId={StableId.NEW_ALERT_ACCT_BAL_NUM_FROM_INPUT}
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
                                stableId={StableId.NEW_ALERT_ACCT_BAL_NUM_TO_INPUT}
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
                          stableId={StableId.NEW_ALERT_ACCT_BAL_PCT_FROM_INPUT}
                          onInput={(event) => {
                            numberInputHandler(event);
                            form.clearErrors('acctBalPctRule.to');
                          }}
                          {...form.register('acctBalPctRule.from', {
                            setValueAs: (value) => Number(sanitizeNumber(value)),
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
                            stableId={StableId.NEW_ALERT_ACCT_BAL_PCT_TO_INPUT}
                            onInput={numberInputHandler}
                            {...form.register('acctBalPctRule.to', {
                              setValueAs: (value) => Number(sanitizeNumber(value)),
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
                      stableId={StableId.NEW_ALERT_EVENT_NAME_INPUT}
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
                      stableId={StableId.NEW_ALERT_EVENT_STANDARD_INPUT}
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
                      stableId={StableId.NEW_ALERT_EVENT_VERSION_INPUT}
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
                      stableId={StableId.NEW_ALERT_FN_CALL_FUNCTION_NAME_INPUT}
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
                onChange={(destinationId, selected) => {
                  if (selected) {
                    setSelectedDestinationIds((prev) => [...prev, destinationId]);
                  } else {
                    setSelectedDestinationIds((prev) => prev.filter((id) => id !== destinationId));
                  }
                }}
              />
            </Flex>

            <HR />

            <Flex justify="spaceBetween" align="center">
              <Button type="submit" loading={createAlertMutation.isLoading} stableId={StableId.NEW_ALERT_CREATE_BUTTON}>
                <FeatherIcon icon="bell" /> Create Alert
              </Button>

              <Link href="/alerts" passHref>
                <TextLink color="neutral" stableId={StableId.NEW_ALERT_CANCEL_BUTTON}>
                  Cancel
                </TextLink>
              </Link>
            </Flex>
          </Flex>
        </Form.Root>
      </Flex>

      <ErrorModal error={createAlertError} resetError={createAlertMutation.reset} />
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
): Api.Mutation.Input<'/alerts/createAlert'> {
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
        rule: {
          type: 'ACCT_BAL_NUM',
          contract: data.contract,
          ...returnAcctBalNumBody(data.acctBalRule.comparator, data.acctBalNumRule),
        },
      };
    case 'ACCT_BAL_PCT':
      if (!data.acctBalRule || !data.acctBalPctRule) throw new Error('Invalid form data for ACCT_BAL_PCT');

      return {
        ...base,
        rule: {
          type: 'ACCT_BAL_PCT',
          contract: data.contract,
          ...returnAcctBalBody(data.acctBalRule.comparator, data.acctBalPctRule),
        },
      };
    case 'EVENT':
      return {
        ...base,
        rule: {
          type: 'EVENT',
          contract: data.contract,
          ...data.eventRule!,
        },
      };
    case 'FN_CALL':
      return {
        ...base,
        rule: {
          type: 'FN_CALL',
          contract: data.contract,
          ...data.fnCallRule!,
        },
      };
    case 'TX_FAILURE':
      return {
        ...base,
        rule: {
          type: 'TX_FAILURE',
          contract: data.contract,
        },
      };
    case 'TX_SUCCESS':
      return {
        ...base,
        rule: {
          type: 'TX_SUCCESS',
          contract: data.contract,
        },
      };
    default:
      assertUnreachable(data.type);
  }
}

function returnAcctBalNumBody(comparator: Alerts.Comparator, { from, to }: { from: string; to: string }) {
  from = convertNearToYocto(from);
  to = convertNearToYocto(to);
  return returnAcctBalBody(comparator, { from, to });
}

function returnAcctBalBody<T extends string | number>(comparator: Alerts.Comparator, { from, to }: { from: T; to: T }) {
  switch (comparator) {
    case 'EQ':
      return {
        from,
        to: from,
      };
    case 'GTE':
      return {
        from,
        to: undefined,
      };
    case 'LTE':
      return {
        from: undefined,
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
