import type { Api } from '@pc/common/types/api';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { useMutation } from '@/hooks/mutation';
import { useSelectedProject } from '@/hooks/selected-project';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';
import type { MapDiscriminatedUnion } from '@/utils/types';

import { useDestinations } from '../hooks/destinations';
import { useVerifyDestinationInterval } from '../hooks/verify-destination-interval';
import { destinationTypes } from '../utils/constants';
import { DeleteDestinationModal } from './DeleteDestinationModal';
import { EmailDestinationVerification } from './EmailDestinationVerification';
import { TelegramDestinationVerification } from './TelegramDestinationVerification';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];
type DestinationType = Destination['type'];
type MappedDestination<K extends DestinationType> = MapDiscriminatedUnion<Destination, 'type'>[K];

type Props = {
  destination: MappedDestination<DestinationType>;
  resetDestination: () => void;
};

interface ModalProps<K extends DestinationType> {
  destination: MappedDestination<K>;
  closeEditModal: () => void;
}

type FormProps<K extends DestinationType> = ModalProps<K>;

export function EditDestinationModal({ destination, resetDestination }: Props) {
  return (
    <Dialog.Root open={Boolean(destination)} onOpenChange={resetDestination}>
      <Dialog.Content title="Edit Destination" size="m">
        {/* The modal content is broken out in to its own component so
        that we'll have a fresh instance each time this modal opens.
        Otherwise, we'd have to worry about manually resetting the state
        and form each time it opened or closed. */}

        <ModalContent closeEditModal={resetDestination} destination={destination} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

function ModalContent<K extends DestinationType>({ closeEditModal, destination }: ModalProps<K>) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const destinationType = destinationTypes[destination.type];

  const formProps: FormProps<DestinationType> = { destination, closeEditModal };

  return (
    <>
      <Flex stack gap="l">
        <Flex justify="spaceBetween" align="center">
          <Flex align="center">
            <FeatherIcon icon={destinationType.icon} color="primary" size="l" />
            <Flex stack gap="none">
              <H5>{destinationType.name}</H5>

              <Text family="code" size="bodySmall">
                {destination.type === 'TELEGRAM' && (destination as MappedDestination<'TELEGRAM'>).config.chatTitle}
                {destination.type === 'WEBHOOK' && (destination as MappedDestination<'WEBHOOK'>).config.url}
                {destination.type === 'EMAIL' && (destination as MappedDestination<'EMAIL'>).config.email}
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

        {destination.type === 'TELEGRAM' && <TelegramDestinationForm {...(formProps as FormProps<'TELEGRAM'>)} />}
        {destination.type === 'WEBHOOK' && <WebhookDestinationForm {...(formProps as FormProps<'WEBHOOK'>)} />}
        {destination.type === 'EMAIL' && <EmailDestinationForm {...(formProps as FormProps<'EMAIL'>)} />}
      </Flex>

      <DeleteDestinationModal
        destination={destination}
        onDelete={closeEditModal}
        show={showDeleteModal}
        setShow={setShowDeleteModal}
      />
    </>
  );
}

const useUpdateDestination = (onVerify: () => void) => {
  const { project } = useSelectedProject();
  const { mutate } = useDestinations(project?.slug);
  const updateMutation = useMutation('/alerts/updateDestination', {
    onSuccess: (result, variables) => {
      mutate((destinations) => {
        if (!destinations) {
          return;
        }
        return destinations.map((lookupDestination) => {
          if (lookupDestination.id !== variables.id) {
            return lookupDestination;
          }
          return result;
        });
      });
      openToast({
        type: 'success',
        title: 'Destination was updated.',
      });
    },
    onError: () => {
      openToast({
        type: 'error',
        title: 'Update Error',
        description: 'Failed to update destination.',
      });
    },
    getAnalyticsSuccessData: (destination) => ({
      name: destination.name,
      id: destination.id,
    }),
  });
  useVerifyDestinationInterval(updateMutation.data, mutate, onVerify);
  return updateMutation;
};

interface TelegramFormData {
  name: string;
}

function TelegramDestinationForm({ destination, closeEditModal }: FormProps<'TELEGRAM'>) {
  if (destination.type !== 'TELEGRAM') throw new Error('Invalid destination for TelegramDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<TelegramFormData>();
  const updateDestinationMutation = useUpdateDestination(closeEditModal);

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
  }, [setValue, destination]);

  const submitForm = useCallback(
    (data: TelegramFormData) => {
      updateDestinationMutation.mutate({
        id: destination.id,
        name: data.name,
        config: {
          type: 'TELEGRAM',
        },
      });
    },
    [updateDestinationMutation, destination],
  );

  return (
    <Form.Root disabled={updateDestinationMutation.isLoading} onSubmit={handleSubmit(submitForm)}>
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
              stableId={StableId.EDIT_DESTINATION_MODAL_NAME_INPUT}
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
            loading={updateDestinationMutation.isLoading}
          >
            Update
          </Button>
          <TextButton stableId={StableId.EDIT_DESTINATION_MODAL_CANCEL_BUTTON} color="neutral" onClick={closeEditModal}>
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

function WebhookDestinationForm({ destination, closeEditModal }: FormProps<'WEBHOOK'>) {
  if (destination.type !== 'WEBHOOK') throw new Error('Invalid destination for WebhookDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<WebhookFormData>();
  const updateDestinationMutation = useUpdateDestination(closeEditModal);

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
    setValue('url', destination.config.url);
  }, [setValue, destination]);

  const submitForm = useCallback(
    (data: WebhookFormData) => {
      updateDestinationMutation.mutate({
        id: destination.id,
        name: data.name,
        config: {
          type: 'WEBHOOK',
          url: data.url,
        },
      });
    },
    [updateDestinationMutation, destination],
  );

  return (
    <Form.Root disabled={updateDestinationMutation.isLoading} onSubmit={handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <WebhookDestinationSecret destination={destination} viaConfirm />

        <HR />

        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Destination Name"
              isInvalid={!!formState.errors.name}
              stableId={StableId.EDIT_DESTINATION_MODAL_NAME_INPUT}
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
              stableId={StableId.EDIT_DESTINATION_MODAL_WEBHOOK_URL_INPUT}
              {...register('url', formValidations.url)}
            />
            <Form.Feedback>{formState.errors.url?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex justify="spaceBetween" align="center">
          <Button
            stableId={StableId.EDIT_DESTINATION_MODAL_UPDATE_BUTTON}
            type="submit"
            loading={updateDestinationMutation.isLoading}
          >
            Update
          </Button>
          <TextButton stableId={StableId.EDIT_DESTINATION_MODAL_CANCEL_BUTTON} color="neutral" onClick={closeEditModal}>
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

function EmailDestinationForm({ destination, closeEditModal }: FormProps<'EMAIL'>) {
  if (destination.type !== 'EMAIL') throw new Error('Invalid destination for EmailDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<EmailFormData>();
  const updateDestinationMutation = useUpdateDestination(closeEditModal);

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
  }, [setValue, destination]);

  const submitForm = useCallback(
    (data: EmailFormData) => {
      updateDestinationMutation.mutate({
        id: destination.id,
        name: data.name,
        config: {
          type: 'EMAIL',
        },
      });
    },
    [updateDestinationMutation, destination],
  );

  return (
    <Form.Root disabled={updateDestinationMutation.isLoading} onSubmit={handleSubmit(submitForm)}>
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
              stableId={StableId.EDIT_DESTINATION_MODAL_NAME_INPUT}
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
            loading={updateDestinationMutation.isLoading}
          >
            Update
          </Button>
          <TextButton stableId={StableId.EDIT_DESTINATION_MODAL_CANCEL_BUTTON} color="neutral" onClick={closeEditModal}>
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}
