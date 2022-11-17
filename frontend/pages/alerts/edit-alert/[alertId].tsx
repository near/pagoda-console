import type { Alerts } from '@pc/common/types/alerts';
import type { Api } from '@pc/common/types/api';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, ButtonLink } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H3, H4, H6 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Switch } from '@/components/lib/Switch';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { Tooltip } from '@/components/lib/Tooltip';
import { withSelectedProject } from '@/components/with-selected-project';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import { DeleteAlertModal } from '@/modules/alerts/components/DeleteAlertModal';
import { DestinationsSelector } from '@/modules/alerts/components/DestinationsSelector';
import { alertTypes, amountComparators } from '@/modules/alerts/utils/constants';
import { convertYoctoToNear } from '@/utils/convert-near';
import { formatNumber } from '@/utils/format-number';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

interface NameFormData {
  name: string;
}

const useUpdateAlertPausedMutation = (alertQuery: ReturnType<typeof useQuery<'/alerts/getAlertDetails'>>) =>
  useMutation('/alerts/updateAlert', {
    onMutate: ({ isPaused }) => {
      let prevPaused: boolean | undefined;
      alertQuery.updateCache((prev) => {
        if (!prev) {
          return;
        }
        prevPaused = prev.isPaused;
        return { ...prev, isPaused: isPaused! };
      });
      return prevPaused;
    },
    onError: (_error, _variables, maybePrevPaused) => {
      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update alert.',
      });
      if (typeof maybePrevPaused !== 'boolean') {
        return;
      }
      alertQuery.updateCache((prev) => {
        if (!prev) {
          return;
        }
        return { ...prev, isPaused: maybePrevPaused };
      });
    },
    onSuccess: ({ isPaused }) => {
      openToast({
        type: 'success',
        title: 'Alert Updated',
        description: !isPaused
          ? `Alert has been activated. New events will be recorded.`
          : `Alert has been paused. New events won't be recorded.`,
      });
    },
    getAnalyticsSuccessData: (_, { name, id }) => ({ name, id }),
    getAnalyticsErrorData: ({ name, id }) => ({ name, id }),
  });

const useUpdateAlertNameMutation = (alertQuery: ReturnType<typeof useQuery<'/alerts/getAlertDetails'>>) =>
  useMutation('/alerts/updateAlert', {
    onMutate: ({ name }) => {
      let prevName: string | undefined;
      alertQuery.updateCache((prev) => {
        if (!prev) {
          return;
        }
        prevName = prev.name;
        return { ...prev, name: name! };
      });
      return prevName;
    },
    onError: (_error, _variables, maybePrevName) => {
      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update alert.',
      });
      if (typeof maybePrevName !== 'boolean') {
        return;
      }
      alertQuery.updateCache((prev) => {
        if (!prev) {
          return;
        }
        return { ...prev, name: maybePrevName };
      });
    },
    onSuccess: () => {
      openToast({
        type: 'success',
        title: 'Alert Updated',
        description: 'Alert name has been updated.',
      });
    },
    getAnalyticsSuccessData: (_, { name, id }) => ({ name, id }),
    getAnalyticsErrorData: ({ name, id }) => ({ name, id }),
  });

const useEnableDestinationMutation = (
  alertQuery: ReturnType<typeof useQuery<'/alerts/getAlertDetails'>>,
  destinationsQuery: ReturnType<typeof useQuery<'/alerts/listDestinations'>>,
) =>
  useMutation('/alerts/enableDestination', {
    onMutate: (variables) => {
      let matchedEnabledDestination:
        | Api.Query.Output<'/alerts/getAlertDetails'>['enabledDestinations'][number]
        | undefined;
      alertQuery.updateCache((prev) => {
        if (!prev) {
          return;
        }
        const matchedDestination = destinationsQuery.data?.find(
          (destination) => destination.id === variables.destination,
        );
        matchedEnabledDestination = matchedDestination
          ? {
              id: matchedDestination.id,
              name: matchedDestination.name,
              config:
                matchedDestination.type === 'EMAIL'
                  ? { type: 'EMAIL', config: matchedDestination.config }
                  : matchedDestination.type === 'WEBHOOK'
                  ? { type: 'WEBHOOK', config: matchedDestination.config }
                  : { type: 'TELEGRAM', config: matchedDestination.config },
            }
          : undefined;
        if (!matchedEnabledDestination) {
          return;
        }
        return {
          ...prev,
          enabledDestinations: [...prev.enabledDestinations, matchedEnabledDestination],
        };
      });
      return matchedEnabledDestination;
    },
    onSuccess: (_result, _variables, context) => {
      if (!context) {
        return;
      }
      openToast({
        type: 'success',
        title: 'Alert Updated',
        description: `Destination was enabled: ${context.name}`,
      });
    },
    onError: (_error, variables) => {
      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update alert destination.',
      });
      alertQuery.updateCache((prev) => {
        if (!prev) {
          return;
        }
        return {
          ...prev,
          enabledDestinations: prev.enabledDestinations.filter(
            (destination) => destination.id !== variables.destination,
          ),
        };
      });
    },
    getAnalyticsSuccessData: ({ alert, destination }) => ({ id: alert, destinationId: destination }),
    getAnalyticsErrorData: ({ alert, destination }) => ({ id: alert, destinationId: destination }),
  });

const useDisableDestinationMutation = (alertQuery: ReturnType<typeof useQuery<'/alerts/getAlertDetails'>>) =>
  useMutation('/alerts/disableDestination', {
    onMutate: (variables) => {
      let removedDestination: Api.Query.Output<'/alerts/getAlertDetails'>['enabledDestinations'][number] | undefined;
      alertQuery.updateCache((prev) => {
        if (!prev) {
          return;
        }
        const removedDestinationIndex = prev.enabledDestinations.findIndex(
          (destination) => destination.id !== variables.destination,
        );
        if (removedDestinationIndex === -1) {
          return;
        }
        removedDestination = prev.enabledDestinations[removedDestinationIndex];
        return {
          ...prev,
          enabledDestinations: [
            ...prev.enabledDestinations.slice(0, removedDestinationIndex),
            ...prev.enabledDestinations.slice(removedDestinationIndex + 1),
          ],
        };
      });
      return removedDestination;
    },
    onSuccess: (_result, _variables, context) => {
      if (!context) {
        return;
      }
      openToast({
        type: 'success',
        title: 'Alert Updated',
        description: `Destination was disabled: ${context.name}`,
      });
    },
    onError: (_error, _variables, context) => {
      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update alert destination.',
      });
      alertQuery.updateCache((prev) => {
        if (!prev || !context) {
          return;
        }
        return {
          ...prev,
          enabledDestinations: [...prev.enabledDestinations, context],
        };
      });
    },
    getAnalyticsSuccessData: ({ alert, destination }) => ({ id: alert, destinationId: destination }),
    getAnalyticsErrorData: ({ alert, destination }) => ({ id: alert, destinationId: destination }),
  });

const EditAlert: NextPageWithLayout = () => {
  const router = useRouter();
  const { projectSlug } = useSureProjectContext();
  const alertId = parseInt(router.query.alertId as string) as Alerts.AlertId;
  const nameForm = useForm<NameFormData>();
  const alertQuery = useQuery(['/alerts/getAlertDetails', { id: alertId }]);
  const updateAlertPausedMutation = useUpdateAlertPausedMutation(alertQuery);
  const updateAlertNameMutation = useUpdateAlertNameMutation(alertQuery);
  const onDeleteAlert = useCallback(() => {
    const name = alertQuery.data?.name;
    openToast({
      type: 'success',
      title: 'Alert Deleted',
      description: name,
    });
    router.replace('/alerts');
  }, [router, alertQuery.data]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const selectedDestinationIds = alertQuery.data?.enabledDestinations.map(({ id }) => id) ?? [];

  const destinationsQuery = useQuery(['/alerts/listDestinations', { projectSlug }]);
  const enableDestinationMutation = useEnableDestinationMutation(alertQuery, destinationsQuery);
  const disableDestinationMutation = useDisableDestinationMutation(alertQuery);

  const onSelectionChange = useCallback(
    (destinationId: Alerts.DestinationId, selected: boolean) => {
      if (selected) {
        enableDestinationMutation.mutate({ alert: alertId, destination: destinationId });
      } else {
        disableDestinationMutation.mutate({ alert: alertId, destination: destinationId });
      }
    },
    [enableDestinationMutation, disableDestinationMutation, alertId],
  );

  function openNameForm() {
    setIsEditingName(true);

    setTimeout(() => {
      nameForm.setFocus('name', {
        shouldSelect: true,
      });
    }, 100);
  }

  const updateIsPaused = useCallback(
    (isActive: boolean) => updateAlertPausedMutation.mutate({ id: alertId, isPaused: !isActive }),
    [updateAlertPausedMutation, alertId],
  );
  const updateName = useCallback(
    ({ name }: NameFormData) => updateAlertNameMutation.mutate({ id: alertId, name }),
    [updateAlertNameMutation, alertId],
  );

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
            <H3 as="h1">Edit Alert</H3>
          </Flex>

          <Text>
            To preserve alert history integrity, most fields can&apos;t be edited after an alert is created. You can
            update the alert&apos;s name and destinations.
          </Text>

          <Link href="/alerts" passHref>
            <TextLink stableId={StableId.ALERT_BACK_TO_ALERTS_LINK}>
              <FeatherIcon icon="arrow-left" />
              Alerts
            </TextLink>
          </Link>
        </Flex>

        {alertQuery.status === 'loading' ? (
          <Spinner center />
        ) : alertQuery.status === 'error' ? (
          <div>Error loading alert</div>
        ) : (
          <Flex stack gap="l">
            <Form.Root disabled={nameForm.formState.isSubmitting} onSubmit={nameForm.handleSubmit(updateName)}>
              <Flex stack>
                <Flex justify="spaceBetween" gap="l">
                  {isEditingName && (
                    <Flex gap="none">
                      <Form.Group>
                        <Form.FloatingLabelInput
                          label="Alert Name"
                          isInvalid={!!nameForm.formState.errors.name}
                          css={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                          {...nameForm.register('name', {
                            required: 'Please enter an alert name',
                            maxLength: {
                              value: 100,
                              message: 'Alert name must be 100 characters or less',
                            },
                          })}
                        />
                        <Form.Feedback>{nameForm.formState.errors.name?.message}</Form.Feedback>
                      </Form.Group>

                      <Button
                        stableId={StableId.ALERT_SAVE_ALERT_NAME_BUTTON}
                        aria-label="Save Alert Name"
                        loading={nameForm.formState.isSubmitting}
                        type="submit"
                        color="neutral"
                        css={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        <FeatherIcon icon="check" color="primary" />
                      </Button>
                    </Flex>
                  )}

                  {!isEditingName && (
                    <Flex align="center" css={{ minHeight: 'var(--size-input-height-m)' }}>
                      <H3>
                        {alert.name}{' '}
                        <Button
                          stableId={StableId.ALERT_EDIT_ALERT_NAME_BUTTON}
                          size="s"
                          aria-label="Edit Alert Name"
                          color="transparent"
                          onClick={openNameForm}
                          css={{ verticalAlign: 'middle' }}
                        >
                          <FeatherIcon icon="edit-2" size="xs" color="primary" />
                        </Button>
                      </H3>
                    </Flex>
                  )}

                  <Flex align="center" css={{ width: 'auto', minHeight: 'var(--size-input-height-m)' }}>
                    <Tooltip content={!alertQuery.data.isPaused ? 'Pause this alert' : 'Activate this alert'}>
                      <span>
                        <Switch
                          stableId={StableId.ALERT_ACTIVE_SWITCH}
                          aria-label="Alert Is Active"
                          checked={!alertQuery.data.isPaused}
                          onCheckedChange={updateIsPaused}
                          debounce={true}
                        >
                          <FeatherIcon icon="bell" size="xs" data-on />
                          <FeatherIcon icon="pause" size="xs" data-off />
                        </Switch>
                      </span>
                    </Tooltip>

                    <Tooltip content="View alert activity">
                      <span>
                        <Link href={`/alerts?tab=activity&alertId=${alertQuery.data.id}`} passHref>
                          <ButtonLink
                            stableId={StableId.ALERT_ACTIVITY_LINK}
                            size="s"
                            aria-label="View Alert Activity"
                            color="primaryBorder"
                          >
                            <FeatherIcon icon="list" size="xs" />
                          </ButtonLink>
                        </Link>
                      </span>
                    </Tooltip>

                    <Tooltip content="Delete this alert">
                      <Button
                        stableId={StableId.ALERT_OPEN_DELETE_ALERT_MODAL_BUTTON}
                        size="s"
                        aria-label="Delete Alert"
                        color="danger"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <FeatherIcon icon="trash-2" size="xs" />
                      </Button>
                    </Tooltip>
                  </Flex>
                </Flex>
              </Flex>
            </Form.Root>

            <HR />

            <Flex stack>
              <H4>Target</H4>

              <Flex align="center">
                <FeatherIcon icon="zap" color="text3" />
                <H6>{alertQuery.data.rule.contract}</H6>
              </Flex>
            </Flex>

            <HR />

            <Flex stack>
              <H4>Condition</H4>

              <Flex align="center">
                <FeatherIcon icon={alertTypes[alertQuery.data.rule.type].icon} color="text3" />
                <Flex stack gap="none">
                  <H6>{alertTypes[alertQuery.data.rule.type].name}</H6>
                  <Text>{alertTypes[alertQuery.data.rule.type].description}</Text>
                </Flex>
              </Flex>

              <AlertSettings alert={alertQuery.data} />
            </Flex>

            <HR />

            <Flex stack>
              <H4>Destinations</H4>

              <DestinationsSelector onChange={onSelectionChange} selectedIds={selectedDestinationIds} />
            </Flex>

            <DeleteAlertModal
              alert={alertQuery.data}
              show={showDeleteModal}
              setShow={setShowDeleteModal}
              onDelete={onDeleteAlert}
            />
          </Flex>
        )}
      </Flex>
    </Section>
  );
};

type Alert = Api.Query.Output<'/alerts/getAlertDetails'>;

function AlertSettings({ alert }: { alert: Alert }) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Flex align="center">
        <FeatherIcon icon="settings" color="text3" />
        <Flex stack gap="none">
          {children}
        </Flex>
      </Flex>
    );
  }

  if (alert.rule.type === 'ACCT_BAL_NUM') {
    const comparator = returnAmountComparator(alert.rule.from, alert.rule.to);

    return (
      <Wrapper>
        <H6>{comparator.name}</H6>

        <Text>
          {comparator.value === 'RANGE' && (
            <Flex as="span" wrap>
              <Tooltip number content={`${formatNumber(alert.rule.from)} yoctoⓃ`}>
                <Text as="span" family="number" hasTooltip>
                  {convertYoctoToNear(alert.rule.from, true)}
                </Text>
              </Tooltip>
              <Text as="span" color="text3">
                ..
              </Text>
              <Tooltip content={`${formatNumber(alert.rule.to)} yoctoⓃ`}>
                <Text as="span" family="number" hasTooltip>
                  {convertYoctoToNear(alert.rule.to, true)}
                </Text>
              </Tooltip>
            </Flex>
          )}
          {comparator.value !== 'RANGE' && (
            <Tooltip number content={`${formatNumber(alert.rule.from || alert.rule.to)} yoctoⓃ`}>
              <Text as="span" family="number" hasTooltip>
                {convertYoctoToNear(alert.rule.from || alert.rule.to, true)}
              </Text>
            </Tooltip>
          )}
        </Text>
      </Wrapper>
    );
  }

  if (alert.rule.type === 'ACCT_BAL_PCT') {
    const comparator = returnAmountComparator(alert.rule.from, alert.rule.to);

    return (
      <Wrapper>
        <Flex gap="s">
          <H6>{comparator.name}</H6>

          <Text>
            {comparator.value === 'RANGE' && (
              <>
                <Text as="span" family="number">
                  {alert.rule.from}%
                </Text>{' '}
                <Text as="span" color="text3">
                  ..
                </Text>{' '}
                <Text as="span" family="number">
                  {alert.rule.to}%
                </Text>
              </>
            )}
            {comparator.value !== 'RANGE' && (
              <>
                <Text as="span" family="number">
                  {alert.rule.from || alert.rule.to}%
                </Text>
              </>
            )}
          </Text>
        </Flex>
      </Wrapper>
    );
  }

  if (alert.rule.type === 'EVENT') {
    return (
      <Wrapper>
        <Text>
          Event Name:{' '}
          <Text as="span" color="text1" family="number">
            {alert.rule.event}
          </Text>
        </Text>
        <Text>
          Standard:{' '}
          <Text as="span" color="text1" family="number">
            {alert.rule.standard}
          </Text>
        </Text>
        <Text>
          Version:{' '}
          <Text as="span" color="text1" family="number">
            {alert.rule.version}
          </Text>
        </Text>
      </Wrapper>
    );
  }

  if (alert.rule.type === 'FN_CALL') {
    return (
      <Wrapper>
        <Text>
          Function Name:{' '}
          <Text as="span" color="text1" family="number">
            {alert.rule.function}
          </Text>
        </Text>
      </Wrapper>
    );
  }

  return null;
}

function returnAmountComparator<T extends string | number>(from?: T, to?: T) {
  if (from === to) return amountComparators.EQ;
  if (from === undefined) return amountComparators.LTE;
  if (to === undefined) return amountComparators.GTE;
  return amountComparators.RANGE;
}

EditAlert.getLayout = wrapDashboardLayoutWithOptions({
  redirect: {
    environmentChange: true,
    projectChange: true,
    url: '/alerts',
  },
});

export default withSelectedProject(EditAlert);
