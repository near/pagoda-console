import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H3, H4 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Switch } from '@/components/lib/Switch';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';
import { DeleteAlertModal } from '@/modules/alerts/components/DeleteAlertModal';
import { DestinationsSelector } from '@/modules/alerts/components/DestinationsSelector';
import { updateAlert, useAlert } from '@/modules/alerts/hooks/alerts';
import { alertTypes, amountComparators } from '@/modules/alerts/utils/constants';
import type { Destination } from '@/modules/alerts/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

interface NameFormData {
  name: string;
}

const EditAlert: NextPageWithLayout = () => {
  const router = useRouter();
  const alertId = parseInt(router.query.alertId as string);
  const nameForm = useForm<NameFormData>();
  const { alert, mutate } = useAlert(alertId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [alertIsActive, setAlertIsActive] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<number[]>([]);

  useEffect(() => {
    const destinationIds: number[] = [];

    if (alert) {
      setAlertIsActive(!alert.isPaused);
      nameForm.setValue('name', alert.name);

      alert.webhookDeliveries?.forEach((delivery) => {
        destinationIds.push(delivery.webhookDestination.id);
      });
    }

    setSelectedDestinationIds(destinationIds);
  }, [alert, nameForm]);

  function openNameForm() {
    setIsEditingName(true);

    setTimeout(() => {
      nameForm.setFocus('name', {
        shouldSelect: true,
      });
    }, 100);
  }

  function onDelete() {
    const name = alert?.name;

    openToast({
      type: 'success',
      title: 'Alert Deleted',
      description: name,
    });

    router.replace('/alerts');
  }

  async function submitNameForm(data: NameFormData) {
    const wasUpdated = await update({
      name: data.name,
    });

    mutate({
      ...alert!,
      name: data.name,
    });

    setIsEditingName(false);

    if (wasUpdated) {
      openToast({
        type: 'success',
        title: 'Alert Updated',
        description: 'Alert name has been updated.',
      });
    }
  }

  async function update(data: { isPaused?: boolean; name?: string }) {
    if (!alert) return;

    try {
      const name = data.name || alert.name;
      const isPaused = data.isPaused !== undefined ? data.isPaused : alert.isPaused;

      await updateAlert({
        id: alert.id,
        isPaused,
        name,
      });

      return true;
    } catch (e: any) {
      console.error('Failed to update alert', e);
      setUpdateError('Failed to update alert.');

      return false;
    }
  }

  async function updateIsActive(isActive: boolean) {
    setAlertIsActive(isActive);

    const wasUpdated = await update({
      isPaused: !isActive,
    });

    if (wasUpdated) {
      openToast({
        type: 'success',
        title: 'Alert Updated',
        description: isActive
          ? `Alert has been activated. New events will be recorded.`
          : `Alert has been paused. New events won't be recorded.`,
      });
    }
  }

  function updateSelectedDestination(isSelected: boolean, destination: Destination) {
    // TODO: Call endpoints to update

    openToast({
      type: 'success',
      title: 'Alert Updated',
      description: isSelected
        ? `Destination was enabled: ${destination.name}`
        : `Destination was disabled: ${destination.name}`,
    });
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
            <H3 as="h1">Edit Alert</H3>
          </Flex>

          <Text>
            To preserve alert history integrity, most fields can&apos;t be edited after an alert is created. You can
            update the alert&apos;s name and destinations.
          </Text>

          <Link href="/alerts" passHref>
            <TextLink>
              <Flex align="center" gap="s" as="span">
                <FeatherIcon icon="arrow-left" />
                Alerts
              </Flex>
            </TextLink>
          </Link>
        </Flex>

        {!alert ? (
          <Spinner center />
        ) : (
          <Flex stack gap="l">
            <Form.Root disabled={nameForm.formState.isSubmitting} onSubmit={nameForm.handleSubmit(submitNameForm)}>
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
                    <Switch aria-label="Alert Is Active" checked={alertIsActive} onCheckedChange={updateIsActive}>
                      <FeatherIcon icon="bell" size="xs" data-on />
                      <FeatherIcon icon="pause" size="xs" data-off />
                    </Switch>

                    <Button size="s" aria-label="Delete Alert" color="danger" onClick={() => setShowDeleteModal(true)}>
                      <FeatherIcon icon="trash-2" size="xs" />
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Form.Root>

            <HR />

            <Flex stack>
              <H4>Target</H4>

              <Flex align="center">
                <FeatherIcon icon="zap" color="text3" />
                <Text color="text1" weight="semibold">
                  {alert.contract.address}
                </Text>
              </Flex>
            </Flex>

            <HR />

            <Flex stack>
              <H4>Condition</H4>

              <Flex align="center">
                <FeatherIcon icon={alertTypes[alert.type].icon} color="text3" />
                <Flex stack gap="none">
                  <Text color="text1" weight="semibold">
                    {alertTypes[alert.type].name}
                  </Text>
                  <Text>{alertTypes[alert.type].description}</Text>
                </Flex>
              </Flex>

              {(alert.type === 'ACCT_BAL_NUM' || alert.type === 'ACCT_BAL_PCT') && (
                <Flex align="center">
                  <FeatherIcon icon="settings" color="text3" />

                  <Text>
                    {amountComparators[alert.acctBalRule!.comparator].name}{' '}
                    <Text as="span" color="text1" family="number">
                      {alert.acctBalRule?.amount}
                      {alert.type === 'ACCT_BAL_PCT' ? '%' : ''}
                    </Text>
                  </Text>
                </Flex>
              )}

              {alert.type === 'EVENT' && (
                <Flex align="center">
                  <FeatherIcon icon="settings" color="text3" />
                  <Flex stack gap="none">
                    <Text>
                      Event Name:{' '}
                      <Text as="span" color="text1" family="number">
                        {alert.eventRule?.event}
                      </Text>
                    </Text>
                    <Text>
                      Standard:{' '}
                      <Text as="span" color="text1" family="number">
                        {alert.eventRule?.standard}
                      </Text>
                    </Text>
                    <Text>
                      Version:{' '}
                      <Text as="span" color="text1" family="number">
                        {alert.eventRule?.version}
                      </Text>
                    </Text>
                  </Flex>
                </Flex>
              )}

              {alert.type === 'FN_CALL' && (
                <Flex align="center">
                  <FeatherIcon icon="settings" color="text3" />
                  <Text>
                    Function Name:{' '}
                    <Text as="span" color="text1" family="number">
                      {alert.fnCallRule?.function}
                    </Text>
                  </Text>
                </Flex>
              )}
            </Flex>

            <HR />

            <Flex stack>
              <H4>Destinations</H4>

              <DestinationsSelector
                selectedIds={selectedDestinationIds}
                onChange={(event) => {
                  setSelectedDestinationIds(event.selectedIds);
                  updateSelectedDestination(event.isSelected, event.destination);
                }}
              />
            </Flex>

            <ErrorModal error={updateError} setError={setUpdateError} />
            <DeleteAlertModal alert={alert} show={showDeleteModal} setShow={setShowDeleteModal} onDelete={onDelete} />
          </Flex>
        )}
      </Flex>
    </Section>
  );
};

EditAlert.getLayout = wrapDashboardLayoutWithOptions({
  redirect: {
    environmentChange: true,
    projectChange: true,
    url: '/alerts',
  },
});

export default EditAlert;
