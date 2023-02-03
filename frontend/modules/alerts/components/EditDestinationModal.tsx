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
import { useApiMutation } from '@/hooks/api-mutation';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

import { useDestinations } from '../hooks/destinations';
import { useVerifyDestinationInterval } from '../hooks/verify-destination-interval';
import { destinationTypes } from '../utils/constants';
import { DeleteDestinationModal } from './DeleteDestinationModal';
import { EmailDestinationVerification } from './EmailDestinationVerification';
import { TelegramDestinationVerification } from './TelegramDestinationVerification';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

interface Props {
  destination: Destination;
  show: boolean;
  setShow: (show: boolean) => void;
}

interface FormProps extends Props {
  onUpdate: (destination: Destination) => void;
}

interface WebhookFormProps extends FormProps {
  onSecretRotate: (destination: Destination) => void;
}

function useUpdateDestinationMutation() {
  const updateDestinationMutation = useApiMutation('/alerts/updateDestination', {
    onSuccess: (destination) => {
      analytics.track('DC Update Destination', {
        status: 'success',
        name: destination.name,
        id: destination.id,
      });
    },
    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Update Destination',
        toastTitle: 'Update Error',
        toastDescription: 'Failed to update destination.',
      });
    },
  });

  return { updateDestinationMutation };
}

export function EditDestinationModal(props: Props) {
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

function ModalContent(props: Props) {
  const { mutate } = useDestinations(props.destination.projectSlug);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const destinationType = destinationTypes[props.destination.type];

  useVerifyDestinationInterval(
    props.destination,
    mutate,
    useCallback(() => props.setShow(false), [props]),
  );

  function onDelete() {
    mutate();
    props.setShow(false);
  }

  function onUpdate() {
    mutate();

    openToast({
      type: 'success',
      title: 'Destination was updated.',
    });

    props.setShow(false);
  }

  function onWebhookSecretRotate() {
    mutate();

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
                {props.destination.type === 'TELEGRAM' && props.destination.config.chatTitle}
                {props.destination.type === 'WEBHOOK' && props.destination.config.url}
                {props.destination.type === 'EMAIL' && props.destination.config.email}
                {props.destination.type === 'AGGREGATION' && props.destination.config.indexerName}
                {props.destination.type === 'AGGREGATION' && props.destination.config.indexerFunctionCode}
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

        {props.destination.type === 'TELEGRAM' && <TelegramDestinationForm onUpdate={onUpdate} {...props} />}
        {props.destination.type === 'WEBHOOK' && (
          <WebhookDestinationForm onUpdate={onUpdate} onSecretRotate={onWebhookSecretRotate} {...props} />
        )}
        {props.destination.type === 'EMAIL' && <EmailDestinationForm onUpdate={onUpdate} {...props} />}
        {props.destination.type === 'AGGREGATION' && <AggregationDestinationForm onUpdate={onUpdate} {...props} />}
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

function TelegramDestinationForm({ destination, onUpdate, setShow }: FormProps) {
  if (destination.type !== 'TELEGRAM') throw new Error('Invalid destination for TelegramDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<TelegramFormData>();
  const { updateDestinationMutation } = useUpdateDestinationMutation();

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
  }, [setValue, destination]);

  function submitForm(data: TelegramFormData) {
    updateDestinationMutation.mutate(
      {
        id: destination.id,
        name: data.name,
        config: {
          type: 'TELEGRAM',
        },
      },
      {
        onSuccess: (destination) => {
          onUpdate(destination);
        },
      },
    );
  }

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
  const { updateDestinationMutation } = useUpdateDestinationMutation();

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
    setValue('url', destination.config.url);
  }, [setValue, destination]);

  function submitForm(data: WebhookFormData) {
    updateDestinationMutation.mutate(
      {
        id: destination.id,
        name: data.name,
        config: {
          type: 'WEBHOOK',
          url: data.url,
        },
      },
      {
        onSuccess: (destination) => {
          onUpdate(destination);
        },
      },
    );
  }

  return (
    <Form.Root disabled={updateDestinationMutation.isLoading} onSubmit={handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <WebhookDestinationSecret destination={destination} onRotate={onSecretRotate} />

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

function EmailDestinationForm({ destination, onUpdate, setShow }: FormProps) {
  if (destination.type !== 'EMAIL') throw new Error('Invalid destination for EmailDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<EmailFormData>();
  const { updateDestinationMutation } = useUpdateDestinationMutation();

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
  }, [setValue, destination]);

  function submitForm(data: EmailFormData) {
    updateDestinationMutation.mutate(
      {
        id: destination.id,
        name: data.name,
        config: {
          type: 'EMAIL',
        },
      },
      {
        onSuccess: (destination) => {
          onUpdate(destination);
        },
      },
    );
  }

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
  indexerName: string;
  indexerFunctionCode: string;
}

function AggregationDestinationForm({ destination, onUpdate, setShow }: FormProps) {
  if (destination.type !== 'AGGREGATION') throw new Error('Invalid destination for AggregationDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<AggregationFormData>();
  const { updateDestinationMutation } = useUpdateDestinationMutation();

  useEffect(() => {
    if (destination.name) {
      setValue('name', destination.name);
    }
    setValue('indexerName', destination.config.indexerName);
    setValue('indexerFunctionCode', destination.config.indexerFunctionCode);
  }, [setValue, destination]);

  function submitForm(data: AggregationFormData) {
    updateDestinationMutation.mutate(
      {
        id: destination.id,
        name: data.name,
        config: {
          type: 'AGGREGATION',
          indexerName: data.indexerName,
          indexerFunctionCode: data.indexerFunctionCode,
        },
      },
      {
        onSuccess: (destination) => {
          onUpdate(destination);
        },
      },
    );
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
              label="Indexer Name"
              placeholder="aggregations.buildnear.testnet"
              isInvalid={!!formState.errors.indexerName}
              stableId={StableId.EDIT_DESTINATION_MODAL_AGGREGATION_CONTRACT_NAME_INPUT}
              {...register('indexerName')}
            />
            <Form.Feedback>{formState.errors.indexerName?.message}</Form.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="indexerFunctionCode">Indexer Function Code</Form.Label>
            <Text family="code">indexer_function(block, context) &#123; </Text>
            <Form.Textarea
              id="indexerFunctionCode"
              style={{ whiteSpace: 'pre-line' }}
              placeholder={['for(let a in block.getActions()) {', '  context.save(a);', '}'].join('\n')}
              isInvalid={!!formState.errors.indexerFunctionCode}
              stableId={StableId.EDIT_DESTINATION_MODAL_AGGREGATION_FUNCTION_NAME_INPUT}
              {...register('indexerFunctionCode')}
            />
            <Text family="code"> &#125; </Text>
            <Form.Feedback>{formState.errors.indexerFunctionCode?.message}</Form.Feedback>
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
