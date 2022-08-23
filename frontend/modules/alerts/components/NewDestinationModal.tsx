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
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { formValidations } from '@/utils/constants';

import { createDestination, useDestinations } from '../hooks/destinations';
import { useVerifyDestinationInterval } from '../hooks/verify-destination-interval';
import { destinationTypeOptions } from '../utils/constants';
import type { Destination, DestinationType, NewDestination } from '../utils/types';
import { EmailDestinationVerification } from './EmailDestinationVerification';
import { TelegramDestinationVerification } from './TelegramDestinationVerification';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

interface Props {
  onCreate?: (destination: Destination) => void;
  onVerify?: (destination: Destination) => void;
  projectSlug: string;
  show: boolean;
  setShow: (show: boolean) => void;
}

interface FormProps extends Props {
  setIsCreated: (value: boolean) => void;
}

function useNewDestinationForm<T>(props: FormProps) {
  const { mutate } = useDestinations(props.projectSlug);
  const [destination, setDestination] = useState<Destination>();
  const form = useForm<T>();

  useVerifyDestinationInterval(destination, mutate, props.setShow, props.onVerify);

  async function create(data: NewDestination) {
    try {
      const destination = await createDestination(data);

      mutate((state) => {
        return [...(state || []), destination];
      });

      props.setIsCreated(true);
      setDestination(destination);

      if (props.onCreate) props.onCreate(destination);
    } catch (e: any) {
      console.error('Failed to create destination', e);
      openToast({
        type: 'error',
        title: 'Failed to create destination.',
      });
    }
  }

  return {
    create,
    destination,
    form,
  };
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
  const [destinationType, setDestinationType] = useState<DestinationType>('TELEGRAM');
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

      {destinationType === 'TELEGRAM' && <TelegramDestinationForm setIsCreated={setIsCreated} {...props} />}
      {destinationType === 'WEBHOOK' && <WebhookDestinationForm setIsCreated={setIsCreated} {...props} />}
      {destinationType === 'EMAIL' && <EmailDestinationForm setIsCreated={setIsCreated} {...props} />}
    </Flex>
  );
}

function TelegramDestinationForm(props: FormProps) {
  const { create, destination, form } = useNewDestinationForm(props);

  async function submitForm() {
    await create({
      config: {},
      projectSlug: props.projectSlug,
      type: 'TELEGRAM',
    });
  }

  if (destination)
    return (
      <Flex stack gap="l">
        <Flex align="center">
          <FeatherIcon icon="check-circle" color="primary" size="m" />
          <H5>Telegram destination has been created.</H5>
        </Flex>

        <TelegramDestinationVerification destination={destination} />
      </Flex>
    );

  return (
    <Form.Root disabled={form.formState.isSubmitting} onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Text color="text1">
          Once you create a Telegram destination, you&apos;ll have one last step: connecting with our{' '}
          <span style={{ whiteSpace: 'nowrap' }}>Telegram bot.</span>
        </Text>

        <Flex>
          <Button loading={form.formState.isSubmitting} type="submit" stableId="create-destination">
            Create
          </Button>
          <Button onClick={() => props.setShow(false)} color="neutral" stableId="cancel-create-destination">
            Cancel
          </Button>
        </Flex>
      </Flex>
    </Form.Root>
  );
}

interface WebhookFormData {
  url: string;
}

function WebhookDestinationForm(props: FormProps) {
  const { create, destination, form } = useNewDestinationForm<WebhookFormData>(props);

  async function submitForm(data: WebhookFormData) {
    await create({
      config: {
        url: data.url,
      },
      projectSlug: props.projectSlug,
      type: 'WEBHOOK',
    });
  }

  if (destination)
    return (
      <Flex stack gap="l">
        <Flex align="center">
          <FeatherIcon icon="check-circle" color="primary" size="m" />
          <H5>Webhook destination has been created.</H5>
        </Flex>

        <WebhookDestinationSecret destination={destination} />

        <Flex gap="l" align="center">
          <Button onClick={() => props.setShow(false)}>Finish</Button>
          <Text size="bodySmall" color="text3">
            You can access this secret again by visiting the Alerts page, clicking the Destinations tab, and then
            clicking on a specific destination.
          </Text>
        </Flex>
      </Flex>
    );

  return (
    <Form.Root disabled={form.formState.isSubmitting} onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Webhook URL"
              placeholder="https://example.com/webhook"
              isInvalid={!!form.formState.errors.url}
              {...form.register('url', formValidations.url)}
            />
            <Form.Feedback>{form.formState.errors.url?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex>
          <Button loading={form.formState.isSubmitting} type="submit">
            Create
          </Button>
          <Button onClick={() => props.setShow(false)} color="neutral">
            Cancel
          </Button>
        </Flex>
      </Flex>
    </Form.Root>
  );
}

interface EmailFormData {
  email: string;
}

function EmailDestinationForm(props: FormProps) {
  const { create, destination, form } = useNewDestinationForm<EmailFormData>(props);

  async function submitForm(data: EmailFormData) {
    await create({
      config: {
        email: data.email,
      },
      projectSlug: props.projectSlug,
      type: 'EMAIL',
    });
  }

  if (destination)
    return (
      <Flex stack gap="l">
        <Flex align="center">
          <FeatherIcon icon="check-circle" color="primary" size="m" />
          <H5>Email destination has been created.</H5>
        </Flex>

        <EmailDestinationVerification destination={destination} />
      </Flex>
    );

  return (
    <Form.Root disabled={form.formState.isSubmitting} onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Email address"
              placeholder="myawesomeemail@pagoda.com"
              isInvalid={!!form.formState.errors.email}
              {...form.register('email', formValidations.email)}
            />
            <Form.Feedback>{form.formState.errors.email?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex>
          <Button loading={form.formState.isSubmitting} type="submit">
            Create
          </Button>
          <Button onClick={() => props.setShow(false)} color="neutral">
            Cancel
          </Button>
        </Flex>
      </Flex>
    </Form.Root>
  );
}
