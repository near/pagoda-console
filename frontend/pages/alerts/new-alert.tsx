import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Box } from '@/components/lib/Box';
import { Button, ButtonLink } from '@/components/lib/Button';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1, H2, H3, H4 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useContracts } from '@/hooks/contracts';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import { alertTypeOptions, amountComparatorOptions } from '@/modules/alerts/utils/constants';
import type { AcctBalRule, Alert, AlertType, EventRule, FnCallRule, TxRule } from '@/modules/alerts/utils/types';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import type { NextPageWithLayout } from '@/utils/types';

interface FormData {
  acctBalRule?: AcctBalRule;
  alertType: AlertType;
  contractId: string;
  eventRule?: EventRule;
  fnCallRule?: FnCallRule;
  txRule?: TxRule;
}

const NewAlert: NextPageWithLayout = () => {
  const router = useRouter();
  const { register, handleSubmit, formState, control, watch } = useForm<FormData>();
  const { project, environment } = useSelectedProject();
  const { contracts } = useContracts(project?.slug, environment?.subId);
  const [createError, setCreateError] = useState('');

  const selectedAlertType = watch('alertType');

  async function createAlert(data: FormData) {
    try {
      const txRule = data.alertType === 'TX_SUCCESS' || data.alertType === 'TX_FAILURE' ? data.txRule || {} : undefined;

      const alert: Alert = await authenticatedPost(
        '/alerts/createAlert',
        {
          type: data.alertType,
          contract: parseInt(data.contractId),
          environment: environment?.subId,
          acctBalRule: data.acctBalRule,
          eventRule: data.eventRule,
          fnCallRule: data.fnCallRule,
          txRule,
        },
        { forceRefresh: true },
      );

      analytics.track('DC Create New Alert', {
        status: 'success',
        name: alert.name,
        id: alert.id,
      });

      openToast({
        type: 'success',
        title: 'Success!',
        description: 'Your alert was created.',
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
              <Flex align="center" gap="s" as="span">
                <FeatherIcon icon="arrow-left" />
                Alerts
              </Flex>
            </TextLink>
          </Link>
        </Flex>

        <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(createAlert)}>
          <Flex stack gap="l">
            <Flex stack>
              <H4>
                <Text as="span" color="text3" size="h4" family="number">
                  1.
                </Text>{' '}
                Select Target
              </H4>

              <Controller
                name="contractId"
                control={control}
                rules={{
                  required: 'Please select a contract',
                }}
                render={({ field }) => {
                  const selection = contracts?.find((c) => c.id.toString() === field.value);

                  return (
                    <Form.Group>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <Form.FloatingLabelSelect
                            label="Contract Address"
                            isInvalid={!!formState.errors.contractId}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            selection={
                              selection && (
                                <>
                                  <FeatherIcon icon="zap" color="primary" size="xs" />
                                  {selection.address}
                                </>
                              )
                            }
                          />
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content align="start">
                          {!contracts && (
                            <DropdownMenu.ContentItem>
                              <Spinner center size="s" />
                            </DropdownMenu.ContentItem>
                          )}

                          {contracts?.length === 0 && (
                            <DropdownMenu.ContentItem>
                              <Text>
                                You don&apos;t have any contracts saved for this environment yet. Visit the{' '}
                                <Link href="/contracts" passHref>
                                  <TextLink>Contracts</TextLink>
                                </Link>{' '}
                                page to save a contract.
                              </Text>
                            </DropdownMenu.ContentItem>
                          )}

                          <DropdownMenu.RadioGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                            {contracts?.map((contract) => (
                              <DropdownMenu.RadioItem value={contract.id.toString()} key={contract.id}>
                                {contract.address}
                              </DropdownMenu.RadioItem>
                            ))}
                          </DropdownMenu.RadioGroup>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>

                      <Form.Feedback>{formState.errors.contractId?.message}</Form.Feedback>
                    </Form.Group>
                  );
                }}
              />
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
                name="alertType"
                control={control}
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
                            isInvalid={!!formState.errors.alertType}
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

                        <DropdownMenu.Content align="start">
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

                      <Form.Feedback>{formState.errors.alertType?.message}</Form.Feedback>
                    </Form.Group>
                  );
                }}
              />

              {(selectedAlertType === 'ACCT_BAL_NUM' || selectedAlertType === 'ACCT_BAL_PCT') && (
                <>
                  <Flex>
                    <Controller
                      name="acctBalRule.comparator"
                      control={control}
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
                                  isInvalid={!!formState.errors.acctBalRule?.comparator}
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

                            <Form.Feedback>{formState.errors.alertType?.message}</Form.Feedback>
                          </Form.Group>
                        );
                      }}
                    />

                    <Form.Group>
                      <Form.FloatingLabelInput
                        label={selectedAlertType === 'ACCT_BAL_PCT' ? 'Amount (%)' : 'Amount'}
                        type="number"
                        isInvalid={!!formState.errors.acctBalRule?.amount}
                        {...register('acctBalRule.amount', {
                          valueAsNumber: true,
                          required: 'Please enter an amount',
                        })}
                      />
                      <Form.Feedback>{formState.errors.acctBalRule?.amount?.message}</Form.Feedback>
                    </Form.Group>
                  </Flex>
                </>
              )}

              {selectedAlertType === 'EVENT' && (
                <>
                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Event Name"
                      isInvalid={!!formState.errors.eventRule?.event}
                      {...register('eventRule.event', {
                        required: 'Please enter an event name',
                      })}
                    />
                    <Form.Feedback>{formState.errors.eventRule?.event?.message}</Form.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Standard"
                      isInvalid={!!formState.errors.eventRule?.standard}
                      {...register('eventRule.standard', {
                        required: 'Please enter a standard',
                      })}
                    />
                    <Form.Feedback>{formState.errors.eventRule?.standard?.message}</Form.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Version"
                      isInvalid={!!formState.errors.eventRule?.version}
                      {...register('eventRule.version', {
                        required: 'Please enter a version',
                      })}
                    />
                    <Form.Feedback>{formState.errors.eventRule?.version?.message}</Form.Feedback>
                  </Form.Group>
                </>
              )}

              {selectedAlertType === 'FN_CALL' && (
                <>
                  <Form.Group>
                    <Form.FloatingLabelInput
                      label="Function Name"
                      isInvalid={!!formState.errors.fnCallRule?.function}
                      {...register('fnCallRule.function', {
                        required: 'Please enter a function name',
                      })}
                    />
                    <Form.Feedback>{formState.errors.fnCallRule?.function?.message}</Form.Feedback>
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
                Select Destination
              </H4>

              <Text>TODO</Text>
            </Flex>

            <HR />

            <Flex justify="spaceBetween" align="center">
              <Button type="submit" loading={formState.isSubmitting}>
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

NewAlert.getLayout = useDashboardLayout;

export default NewAlert;
