import type { Api } from '@pc/common/types/api';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { KeyedMutator } from 'swr';

import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H5 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { TextButton } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';
import type { MapDiscriminatedUnion } from '@/utils/types';

import { updateDestination, useDestinations } from '../hooks/destinations';
import { useVerifyDestinationInterval } from '../hooks/verify-destination-interval';
import { destinationTypes } from '../utils/constants';
import { DeleteDestinationModal } from './DeleteDestinationModal';
import { EmailDestinationVerification } from './EmailDestinationVerification';
import { TelegramDestinationVerification } from './TelegramDestinationVerification';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];
type DestinationType = Destination['type'];
type MappedDestination<K extends DestinationType> = MapDiscriminatedUnion<Destination, 'type'>[K];

interface Props<K extends DestinationType> {
  destination: MappedDestination<K>;
  show: boolean;
  setShow: (show: boolean) => void;
}

interface FormProps<K extends DestinationType> extends Props<K> {
  onUpdate: (destination: MappedDestination<K>) => void;
}

interface WebhookFormProps extends FormProps<'WEBHOOK'> {
  onSecretRotate: (destination: MappedDestination<'WEBHOOK'>) => void;
}

export function EditDestinationModal<K extends DestinationType>(props: Props<K>) {
  return (
    <Dialog.Root open={props.show} onOpenChange={props.setShow}>
      <Dialog.Content title="Edit Destination" size="m">
        {/* The modal content is broken out in to its own component so
        that we'll have a fresh instance each time this modal opens.
        Otherwise, we'd have to worry about manually resetting the state
        and form each time it opened or closed. */}

        <ModalContent {...props} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

function ModalContent<K extends DestinationType>(props: Props<K>) {
  const { mutate } = useDestinations(props.destination.projectSlug);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const destinationType = destinationTypes[props.destination.type];

  useVerifyDestinationInterval<Destination>(
    props.destination,
    mutate as unknown as KeyedMutator<Destination[]>,
    useCallback(() => props.setShow(false), [props]),
  );

  function onDelete() {
    mutate((data) => {
      return data?.filter((d) => d.id !== props.destination.id);
    });

    props.setShow(false);
  }

  function onUpdate(updated: MappedDestination<K>) {
    mutate((destinations) => {
      return destinations?.map((d) => {
        if (d.id === updated.id) {
          return {
            ...updated,
          };
        }

        return d;
      });
    });

    openToast({
      type: 'success',
      title: 'Destination was updated.',
    });

    props.setShow(false);
  }

  function onWebhookSecretRotate(updated: Destination) {
    mutate((destinations) => {
      return destinations?.map((d) => {
        if (d.id === updated.id) {
          return {
            ...updated,
          };
        }

        return d;
      });
    });

    openToast({
      type: 'success',
      title: 'Webhook secret was rotated.',
    });
  }

  return (
    <>
      <Flex stack gap="l">
        <Flex justify="spaceBetween" align="center">
          <Flex align="center">
            <FeatherIcon icon={destinationType.icon} color="primary" size="l" />
            <Flex stack gap="none">
              <H5>{destinationType.name}</H5>

              <Text family="code" size="bodySmall">
                {props.destination.type === 'TELEGRAM' && (props as Props<'TELEGRAM'>).destination.config.chatTitle}
                {props.destination.type === 'WEBHOOK' && (props as Props<'WEBHOOK'>).destination.config.url}
                {props.destination.type === 'EMAIL' && (props as Props<'EMAIL'>).destination.config.email}
                {props.destination.type === 'AGGREGATION' &&
                  (props as Props<'AGGREGATION'>).destination.config.contractName}
                {props.destination.type === 'AGGREGATION' &&
                  (props as Props<'AGGREGATION'>).destination.config.functionName}
              </Text>
            </Flex>
          </Flex>

          <Button
            stableId={StableId.EDIT_DESTINATION_MODAL_OPEN_DELETE_MODAL_BUTTON}
            size="s"
            aria-label="Delete Destination"
            color="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <FeatherIcon icon="trash-2" size="xs" />
          </Button>
        </Flex>

        {props.destination.type === 'TELEGRAM' && (
          <TelegramDestinationForm
            onUpdate={onUpdate as FormProps<'TELEGRAM'>['onUpdate']}
            {...(props as Props<'TELEGRAM'>)}
          />
        )}
        {props.destination.type === 'WEBHOOK' && (
          <WebhookDestinationForm
            onUpdate={onUpdate as FormProps<'WEBHOOK'>['onUpdate']}
            onSecretRotate={onWebhookSecretRotate}
            {...(props as Props<'WEBHOOK'>)}
          />
        )}
        {props.destination.type === 'EMAIL' && (
          <EmailDestinationForm onUpdate={onUpdate as FormProps<'EMAIL'>['onUpdate']} {...(props as Props<'EMAIL'>)} />
        )}
        {props.destination.type === 'AGGREGATION' && (
          <AggregationDestinationForm
            onUpdate={onUpdate as FormProps<'AGGREGATION'>['onUpdate']}
            {...(props as Props<'AGGREGATION'>)}
          />
        )}
      </Flex>

      <DeleteDestinationModal
        destination={props.destination}
        onDelete={onDelete}
        show={showDeleteModal}
        setShow={setShowDeleteModal}
      />
    </>
  );
}

interface TelegramFormData {
  name: string;
}

function TelegramDestinationForm({ destination, onUpdate, setShow }: FormProps<'TELEGRAM'>) {
  if (destination.type !== 'TELEGRAM') throw new Error('Invalid destination for TelegramDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<TelegramFormData>();

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
  }, [setValue, destination]);

  async function submitForm(data: TelegramFormData) {
    try {
      const updated = await updateDestination<'TELEGRAM'>({
        id: destination.id,
        name: data.name,
        config: {
          type: 'TELEGRAM',
        },
      });

      onUpdate(updated);
    } catch (e: any) {
      console.error('Failed to update destination', e);

      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update destination.',
      });
    }
  }

  return (
    <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitForm)}>
      <Flex stack gap="l">
        {!destination.isValid && (
          <>
            <TelegramDestinationVerification destination={destination} />
            <HR />
          </>
        )}

        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Destination Name"
              isInvalid={!!formState.errors.name}
              {...register('name', {
                required: 'Please enter a destination name',
                maxLength: {
                  value: 100,
                  message: 'Destination name must be 100 characters or less',
                },
              })}
            />
            <Form.Feedback>{formState.errors.name?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex justify="spaceBetween" align="center">
          <Button
            stableId={StableId.EDIT_DESTINATION_MODAL_UPDATE_BUTTON}
            type="submit"
            loading={formState.isSubmitting}
          >
            Update
          </Button>
          <TextButton
            stableId={StableId.EDIT_DESTINATION_MODAL_CANCEL_BUTTON}
            color="neutral"
            onClick={() => setShow(false)}
          >
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}

interface WebhookFormData {
  name: string;
  url: string;
}

function WebhookDestinationForm({ destination, onUpdate, setShow, onSecretRotate }: WebhookFormProps) {
  if (destination.type !== 'WEBHOOK') throw new Error('Invalid destination for WebhookDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<WebhookFormData>();

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
    setValue('url', destination.config.url);
  }, [setValue, destination]);

  async function submitForm(data: WebhookFormData) {
    try {
      const updated = await updateDestination<'WEBHOOK'>({
        id: destination.id,
        name: data.name,
        config: {
          type: 'WEBHOOK',
          url: data.url,
        },
      });

      onUpdate(updated);
    } catch (e: any) {
      console.error('Failed to update destination', e);

      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update destination.',
      });
    }
  }

  return (
    <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <WebhookDestinationSecret destination={destination} onRotate={onSecretRotate} />

        <HR />

        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Destination Name"
              isInvalid={!!formState.errors.name}
              {...register('name', {
                required: 'Please enter a destination name',
                maxLength: {
                  value: 100,
                  message: 'Destination name must be 100 characters or less',
                },
              })}
            />
            <Form.Feedback>{formState.errors.name?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.FloatingLabelInput
              label="Webhook URL"
              placeholder="https://example.com/webhook"
              isInvalid={!!formState.errors.url}
              {...register('url', formValidations.url)}
            />
            <Form.Feedback>{formState.errors.url?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex justify="spaceBetween" align="center">
          <Button
            stableId={StableId.EDIT_DESTINATION_MODAL_UPDATE_BUTTON}
            type="submit"
            loading={formState.isSubmitting}
          >
            Update
          </Button>
          <TextButton
            stableId={StableId.EDIT_DESTINATION_MODAL_CANCEL_BUTTON}
            color="neutral"
            onClick={() => setShow(false)}
          >
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}

interface EmailFormData {
  name: string;
}

function EmailDestinationForm({ destination, onUpdate, setShow }: FormProps<'EMAIL'>) {
  if (destination.type !== 'EMAIL') throw new Error('Invalid destination for EmailDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<EmailFormData>();

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
  }, [setValue, destination]);

  async function submitForm(data: EmailFormData) {
    try {
      const updated = await updateDestination<'EMAIL'>({
        id: destination.id,
        name: data.name,
        config: {
          type: 'EMAIL',
        },
      });

      onUpdate(updated);
    } catch (e: any) {
      console.error('Failed to update destination', e);

      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update destination.',
      });
    }
  }

  return (
    <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitForm)}>
      <Flex stack gap="l">
        {!destination.isValid && (
          <>
            <EmailDestinationVerification destination={destination} />
            <HR />
          </>
        )}

        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Destination Name"
              isInvalid={!!formState.errors.name}
              {...register('name', {
                required: 'Please enter a destination name',
                maxLength: {
                  value: 100,
                  message: 'Destination name must be 100 characters or less',
                },
              })}
            />
            <Form.Feedback>{formState.errors.name?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex justify="spaceBetween" align="center">
          <Button
            stableId={StableId.EDIT_DESTINATION_MODAL_UPDATE_BUTTON}
            type="submit"
            loading={formState.isSubmitting}
          >
            Update
          </Button>
          <TextButton
            stableId={StableId.EDIT_DESTINATION_MODAL_CANCEL_BUTTON}
            color="neutral"
            onClick={() => setShow(false)}
          >
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}

interface AggregationFormData {
  name: string;
  contractName: string;
  functionName: string;
}

function AggregationDestinationForm({ destination, onUpdate, setShow }: AggregationFormProps) {
  if (destination.type !== 'AGGREGATION') throw new Error('Invalid destination for AggregationDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<AggregationFormData>();

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
    setValue('contractName', destination.config.contractName);
    setValue('functionName', destination.config.functionName);
  }, [setValue, destination]);

  async function submitForm(data: AggregationFormData) {
    try {
      const updated = await updateDestination<'AGGREGATION'>({
        id: destination.id,
        name: data.name,
        config: {
          type: 'AGGREGATION',
          contractName: data.contractName,
          functionName: data.functionName,
        },
      });

      onUpdate(updated);
    } catch (e: any) {
      console.error('Failed to update destination', e);

      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update destination.',
      });
    }
  }

  return (
    <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <HR />

        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Destination Name"
              isInvalid={!!formState.errors.name}
              {...register('name', {
                required: 'Please enter a destination name',
                maxLength: {
                  value: 100,
                  message: 'Destination name must be 100 characters or less',
                },
              })}
            />
            <Form.Feedback>{formState.errors.name?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.FloatingLabelInput
              label="Aggregation Contract Name"
              placeholder="aggregations.buildnear.testnet"
              isInvalid={!!formState.errors.contractName}
              {...register('contractName')}
            />
            <Form.Feedback>{formState.errors.contractName?.message}</Form.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Aggregation Function Name"
              placeholder="aggregate_best_greetings"
              isInvalid={!!formState.errors.functionName}
              {...register('functionName')}
            />
            <Form.Feedback>{formState.errors.functionName?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex justify="spaceBetween" align="center">
          <Button
            stableId={StableId.EDIT_DESTINATION_MODAL_UPDATE_BUTTON}
            type="submit"
            loading={formState.isSubmitting}
          >
            Update
          </Button>
          <TextButton
            stableId={StableId.EDIT_DESTINATION_MODAL_CANCEL_BUTTON}
            color="neutral"
            onClick={() => setShow(false)}
          >
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}
