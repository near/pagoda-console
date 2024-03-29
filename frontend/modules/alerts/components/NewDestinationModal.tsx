import type { Api } from '@pc/common/types/api';
import { useCallback, useState } from 'react';
import type { FieldValues } from 'react-hook-form';
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
import { TextButton } from '@/components/lib/TextLink';
import { useApiMutation } from '@/hooks/api-mutation';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

import { useDestinations } from '../hooks/destinations';
import { useVerifyDestinationInterval } from '../hooks/verify-destination-interval';
import { destinationTypeOptions } from '../utils/constants';
import { EmailDestinationVerification } from './EmailDestinationVerification';
import { TelegramDestinationVerification } from './TelegramDestinationVerification';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];
type DestinationType = Destination['type'];

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

function useNewDestinationForm<T extends FieldValues>(props: FormProps) {
  const { mutate } = useDestinations(props.projectSlug);
  const [destination, setDestination] = useState<Destination>();
  const form = useForm<T>();

  useVerifyDestinationInterval(
    destination,
    mutate,
    useCallback(
      (nextDestination) => {
        props.onVerify?.(nextDestination);
        props.setShow(false);
      },
      [props],
    ),
  );

  const createDestinationMutation = useApiMutation('/alerts/createDestination', {
    onSuccess: (destination) => {
      mutate();

      props.setIsCreated(true);
      setDestination(destination);

      analytics.track('DC Create New Destination', {
        status: 'success',
        name: destination.name,
        id: destination.id,
      });

      if (props.onCreate) props.onCreate(destination);
    },

    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Create New Destination',
        toastTitle: 'Failed to create destination.',
      });
    },
  });

  return {
    createDestinationMutation,
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
              '@mobile': {
                gridTemplateColumns: '1fr',
              },
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
  const { createDestinationMutation, destination, form } = useNewDestinationForm(props);

  async function submitForm() {
    createDestinationMutation.mutate({
      projectSlug: props.projectSlug,
      config: {
        type: 'TELEGRAM',
      },
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
    <Form.Root disabled={createDestinationMutation.isLoading} onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Text color="text1">
          Once you create a Telegram destination, you&apos;ll have one last step: connecting with our{' '}
          <span style={{ whiteSpace: 'nowrap' }}>Telegram bot.</span>
        </Text>

        <Flex justify="spaceBetween" align="center">
          <Button
            loading={createDestinationMutation.isLoading}
            type="submit"
            stableId={StableId.NEW_DESTINATION_MODAL_CREATE_BUTTON}
          >
            Create
          </Button>
          <TextButton
            onClick={() => props.setShow(false)}
            color="neutral"
            stableId={StableId.NEW_DESTINATION_MODAL_CANCEL_BUTTON}
          >
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}

interface WebhookFormData {
  url: string;
}

function WebhookDestinationForm(props: FormProps) {
  const { createDestinationMutation, destination, form } = useNewDestinationForm<WebhookFormData>(props);

  async function submitForm(data: WebhookFormData) {
    createDestinationMutation.mutate({
      projectSlug: props.projectSlug,
      config: {
        type: 'WEBHOOK',
        ...data,
      },
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
          <Button stableId={StableId.NEW_DESTINATION_MODAL_FINISH_WEBHOOK_BUTTON} onClick={() => props.setShow(false)}>
            Finish
          </Button>
          <Text size="bodySmall" color="text3">
            You can access this secret again by visiting the Alerts page, clicking the Destinations tab, and then
            clicking on a specific destination.
          </Text>
        </Flex>
      </Flex>
    );

  return (
    <Form.Root disabled={createDestinationMutation.isLoading} onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Webhook URL"
              placeholder="https://example.com/webhook"
              isInvalid={!!form.formState.errors.url}
              stableId={StableId.NEW_DESTINATION_MODAL_WEBHOOK_URL_INPUT}
              {...form.register('url', formValidations.url)}
            />
            <Form.Feedback>{form.formState.errors.url?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex justify="spaceBetween" align="center">
          <Button
            loading={createDestinationMutation.isLoading}
            type="submit"
            stableId={StableId.NEW_DESTINATION_MODAL_CREATE_BUTTON}
          >
            Create
          </Button>
          <TextButton
            onClick={() => props.setShow(false)}
            color="neutral"
            stableId={StableId.NEW_DESTINATION_MODAL_CANCEL_BUTTON}
          >
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}

interface EmailFormData {
  email: string;
}

function EmailDestinationForm(props: FormProps) {
  const { createDestinationMutation, destination, form } = useNewDestinationForm<EmailFormData>(props);

  async function submitForm(data: EmailFormData) {
    createDestinationMutation.mutate({
      projectSlug: props.projectSlug,
      config: {
        type: 'EMAIL',
        ...data,
      },
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
    <Form.Root disabled={createDestinationMutation.isLoading} onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Flex stack>
          <Form.Group>
            <Form.FloatingLabelInput
              label="Email address"
              placeholder="myawesomeemail@pagoda.com"
              isInvalid={!!form.formState.errors.email}
              stableId={StableId.NEW_DESTINATION_MODAL_EMAIL_INPUT}
              {...form.register('email', formValidations.email)}
            />
            <Form.Feedback>{form.formState.errors.email?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex justify="spaceBetween" align="center">
          <Button
            loading={createDestinationMutation.isLoading}
            type="submit"
            stableId={StableId.NEW_DESTINATION_MODAL_CREATE_BUTTON}
          >
            Create
          </Button>
          <TextButton
            onClick={() => props.setShow(false)}
            color="neutral"
            stableId={StableId.NEW_DESTINATION_MODAL_CANCEL_BUTTON}
          >
            Cancel
          </TextButton>
        </Flex>
      </Flex>
    </Form.Root>
  );
}
