import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H5 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { TextButton } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { formValidations } from '@/utils/constants';

import { updateDestination, useDestinations } from '../hooks/destinations';
import { destinationTypes } from '../utils/constants';
import type { Destination } from '../utils/types';
import { DeleteDestinationModal } from './DeleteDestinationModal';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

interface Props {
  destination: Destination;
  show: boolean;
  setShow: (show: boolean) => void;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const destinationType = destinationTypes[props.destination.type];
  const { mutate } = useDestinations(props.destination.projectSlug);

  function onDelete() {
    mutate((data) => {
      return data?.filter((d) => d.id !== props.destination.id);
    });

    props.setShow(false);
  }

  function onUpdate(updated: Destination) {
    mutate((destinations) => {
      return destinations?.map((d) => {
        if (d.id === updated.id) {
          return {
            ...d, // TODO: This won't be necessary when update destination API returns full model
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

  return (
    <>
      <Flex stack gap="l">
        <Flex justify="spaceBetween" align="center">
          <Flex align="center">
            <FeatherIcon icon={destinationType.icon} color="primary" size="l" />
            <Flex stack gap="none">
              <H5>{destinationType.name}</H5>
            </Flex>
          </Flex>

          <Button size="s" aria-label="Delete Destination" color="danger" onClick={() => setShowDeleteModal(true)}>
            <FeatherIcon icon="trash-2" size="xs" />
          </Button>
        </Flex>

        <WebhookDestinationForm onUpdate={onUpdate} {...props} />
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

interface WebhookFormData {
  name: string;
  url: string;
}

function WebhookDestinationForm({
  destination,
  onUpdate,
  setShow,
}: Props & {
  onUpdate: (destination: Destination) => void;
}) {
  if (destination.type !== 'WEBHOOK') throw new Error('Invalid destination for WebhookDestinationForm');

  const { formState, setValue, register, handleSubmit } = useForm<WebhookFormData>();

  useEffect(() => {
    setValue('name', destination.name);
    setValue('url', destination.config.url);
  }, [setValue, destination]);

  async function submitForm(data: WebhookFormData) {
    try {
      const updated = await updateDestination({
        id: destination.id,
        type: destination.type,
        name: data.name,
        config: {
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
          <Button type="submit">Update</Button>
          <TextButton color="neutral" onClick={() => setShow(false)}>
            Cancel
          </TextButton>
        </Flex>

        <HR />

        <WebhookDestinationSecret destination={destination} />
      </Flex>
    </Form.Root>
  );
}
