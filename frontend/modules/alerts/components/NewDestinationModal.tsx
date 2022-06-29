import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/lib/Badge';
import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import * as CheckboxCard from '@/components/lib/CheckboxCard';
import * as Dialog from '@/components/lib/Dialog';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H5 } from '@/components/lib/Heading';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { formValidations } from '@/utils/constants';

import { createDestination, useDestinations } from '../hooks/destinations';
import { destinationTypeOptions } from '../utils/constants';
import type { Destination, DestinationType } from '../utils/types';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

interface Props {
  onCreate?: (destination: Destination) => void;
  projectSlug: string;
  show: boolean;
  setShow: (show: boolean) => void;
}

export function NewDestinationModal(props: Props) {
  return (
    <Dialog.Root open={props.show} onOpenChange={props.setShow}>
      <Dialog.Content title="New Destination" size="m">
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
  const [destinationType, setDestinationType] = useState<DestinationType>('WEBHOOK');
  const [isCreated, setIsCreated] = useState(false);

  return (
    <Flex stack gap="l">
      {!isCreated && (
        <CheckboxCard.Group aria-label="Select a destination type">
          <Box
            css={{
              width: '100%',
              display: 'grid',
              gap: 'var(--space-m)',
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            {destinationTypeOptions.map((option) => {
              return (
                <CheckboxCard.Card
                  radio
                  name="destinationType"
                  value={option.value}
                  disabled={option.disabled}
                  checked={option.value === destinationType}
                  onChange={(e) => setDestinationType(e.target.value as DestinationType)}
                  css={{ width: '100%', height: '100%' }}
                  key={option.value}
                >
                  <FeatherIcon icon={option.icon} />
                  <CheckboxCard.Title>{option.name}</CheckboxCard.Title>
                  {option.disabled && <Badge size="s">Soon</Badge>}
                  {!option.disabled && <CheckboxCard.Description>{option.description}</CheckboxCard.Description>}
                </CheckboxCard.Card>
              );
            })}
          </Box>
        </CheckboxCard.Group>
      )}

      {destinationType === 'WEBHOOK' && <WebhookDestinationForm setIsCreated={setIsCreated} {...props} />}
    </Flex>
  );
}

interface WebhookFormData {
  url: string;
}

function WebhookDestinationForm({
  onCreate,
  projectSlug,
  setShow,
  setIsCreated,
}: Props & {
  setIsCreated: (value: boolean) => void;
}) {
  const { mutate } = useDestinations(projectSlug);
  const { register, handleSubmit, formState } = useForm<WebhookFormData>();
  const [createError, setCreateError] = useState('');
  const [createdDestination, setCreatedDestination] = useState<Destination>();

  function finish() {
    if (!createdDestination) return;

    if (onCreate) onCreate(createdDestination);

    setShow(false);
  }

  async function submitForm(data: WebhookFormData) {
    try {
      const destination = await createDestination({
        config: {
          url: data.url,
        },
        projectSlug,
        type: 'WEBHOOK',
      });

      mutate((data) => {
        return [...(data || []), destination];
      });

      setIsCreated(true);
      setCreatedDestination(destination);
    } catch (e: any) {
      console.error('Failed to create destination', e);
      setCreateError('Failed to create destination.');
    }
  }

  if (createdDestination)
    return (
      <Flex stack gap="l">
        <Flex align="center">
          <FeatherIcon icon="check-circle" color="primary" size="m" />
          <H5>Your destination has been created.</H5>
        </Flex>

        <WebhookDestinationSecret destination={createdDestination} />

        <Flex gap="l" align="center">
          <Button onClick={finish}>Finish</Button>
          <Text size="bodySmall" color="text3">
            You can access this secret again by visiting the Alerts page, clicking the Destinations tab, and then
            clicking on a specific destination.
          </Text>
        </Flex>
      </Flex>
    );

  return (
    <Form.Root
      disabled={formState.isSubmitting}
      onSubmit={(e) => {
        e.stopPropagation(); // This prevents any parent forms from being submitted
        handleSubmit(submitForm)(e);
      }}
    >
      <Flex stack gap="l">
        <Flex stack>
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

        <Message type="error" content={createError} dismiss={() => setCreateError('')} />

        <Flex>
          <Button loading={formState.isSubmitting} type="submit">
            Save
          </Button>
          <Button onClick={() => setShow(false)} color="neutral">
            Cancel
          </Button>
        </Flex>
      </Flex>
    </Form.Root>
  );
}
