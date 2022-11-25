import type { Alerts } from '@pc/common/types/alerts';
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
import { openToast } from '@/components/lib/Toast';
import { useMutation } from '@/hooks/mutation';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQueryCache } from '@/hooks/query-cache';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';
import type { MapDiscriminatedUnion } from '@/utils/types';

import { useVerifyDestinationInterval } from '../hooks/verify-destination-interval';
import { destinationTypeOptions } from '../utils/constants';
import { EmailDestinationVerification } from './EmailDestinationVerification';
import { TelegramDestinationVerification } from './TelegramDestinationVerification';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];
type DestinationType = Destination['type'];
type MappedDestination<K extends DestinationType> = MapDiscriminatedUnion<Destination, 'type'>[K];

interface Props<K extends DestinationType> {
  onCreate?: (destination: MappedDestination<K>) => void;
  show: boolean;
  setShow: (show: boolean) => void;
}

type FormProps<K extends DestinationType> = Omit<Props<K>, 'setShow' | 'show'> & {
  closeModal: () => void;
};

function useCreateDestinationMutation<K extends DestinationType>(
  onDone: ((destination: MappedDestination<K>) => void) | undefined,
  onVerify: () => void,
) {
  const { projectSlug } = useSureProjectContext();
  const destinationsCache = useQueryCache('/alerts/listDestinations');
  const createDestinationMutation = useMutation('/alerts/createDestination', {
    onSuccess: (result) => {
      destinationsCache.update({ projectSlug }, (destinations) => {
        if (!destinations) {
          return;
        }
        return [...destinations, result];
      });
      onDone?.(result as MappedDestination<K>);
    },
    onError: () => {
      openToast({
        type: 'error',
        title: 'Failed to create destination.',
      });
    },
    getAnalyticsSuccessData: (_, result) => ({ name: result.name, id: result.id }),
  });

  useVerifyDestinationInterval(createDestinationMutation.data?.id, onVerify);

  return createDestinationMutation;
}

export function NewDestinationModal(props: Props<DestinationType>) {
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

function ModalContent({ setShow, show: _show, onCreate, ...props }: Props<DestinationType>) {
  const [destinationType, setDestinationType] = useState<DestinationType>('TELEGRAM');
  const [isCreated, setIsCreated] = useState(false);

  const formProps: FormProps<DestinationType> = {
    ...props,
    onCreate: useCallback(
      (result) => {
        onCreate?.(result);
        setIsCreated(true);
      },
      [onCreate],
    ),
    closeModal: useCallback(() => setShow(false), [setShow]),
  };
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

      {destinationType === 'TELEGRAM' && <TelegramDestinationForm {...(formProps as FormProps<'TELEGRAM'>)} />}
      {destinationType === 'WEBHOOK' && <WebhookDestinationForm {...(formProps as FormProps<'WEBHOOK'>)} />}
      {destinationType === 'EMAIL' && <EmailDestinationForm {...(formProps as FormProps<'EMAIL'>)} />}
    </Flex>
  );
}

function TelegramDestinationForm(props: FormProps<'TELEGRAM'>) {
  const { projectSlug } = useSureProjectContext();
  const form = useForm<FieldValues>();
  const createDestinationMutation = useCreateDestinationMutation<'TELEGRAM'>(props.onCreate, props.closeModal);

  const submitForm = useCallback(() => {
    createDestinationMutation.mutate({ projectSlug, config: { type: 'TELEGRAM' } });
  }, [createDestinationMutation, projectSlug]);

  if (createDestinationMutation.data)
    return (
      <Flex stack gap="l">
        <Flex align="center">
          <FeatherIcon icon="check-circle" color="primary" size="m" />
          <H5>Telegram destination has been created.</H5>
        </Flex>

        <TelegramDestinationVerification destination={createDestinationMutation.data} />
      </Flex>
    );

  return (
    <Form.Root disabled={createDestinationMutation.isLoading} onSubmit={form.handleSubmit(submitForm)}>
      <Flex stack gap="l">
        <Text color="text1">
          Once you create a Telegram destination, you&apos;ll have one last step: connecting with our{' '}
          <span style={{ whiteSpace: 'nowrap' }}>Telegram bot.</span>
        </Text>

        <Flex>
          <Button
            loading={createDestinationMutation.isLoading}
            type="submit"
            stableId={StableId.NEW_DESTINATION_MODAL_CREATE_BUTTON}
          >
            Create
          </Button>
          <Button onClick={props.closeModal} color="neutral" stableId={StableId.NEW_DESTINATION_MODAL_CANCEL_BUTTON}>
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

function WebhookDestinationForm(props: FormProps<'WEBHOOK'>) {
  const { projectSlug } = useSureProjectContext();
  const form = useForm<WebhookFormData>();
  const createDestinationMutation = useCreateDestinationMutation<'WEBHOOK'>(props.onCreate, props.closeModal);

  const submitForm = useCallback(
    (data: WebhookFormData) => {
      createDestinationMutation.mutate({ projectSlug, config: { type: 'WEBHOOK', url: data.url } });
    },
    [createDestinationMutation, projectSlug],
  );

  if (createDestinationMutation.data)
    return (
      <Flex stack gap="l">
        <Flex align="center">
          <FeatherIcon icon="check-circle" color="primary" size="m" />
          <H5>Webhook destination has been created.</H5>
        </Flex>

        <WebhookDestinationSecret destination={createDestinationMutation.data as Alerts.WebhookDestination} />

        <Flex gap="l" align="center">
          <Button stableId={StableId.NEW_DESTINATION_MODAL_FINISH_WEBHOOK_BUTTON} onClick={props.closeModal}>
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
              {...form.register('url', formValidations.url)}
            />
            <Form.Feedback>{form.formState.errors.url?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex>
          <Button
            loading={createDestinationMutation.isLoading}
            type="submit"
            stableId={StableId.NEW_DESTINATION_MODAL_CREATE_BUTTON}
          >
            Create
          </Button>
          <Button onClick={props.closeModal} color="neutral" stableId={StableId.NEW_DESTINATION_MODAL_CANCEL_BUTTON}>
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

function EmailDestinationForm(props: FormProps<'EMAIL'>) {
  const { projectSlug } = useSureProjectContext();
  const form = useForm<EmailFormData>();
  const createDestinationMutation = useCreateDestinationMutation<'EMAIL'>(props.onCreate, props.closeModal);

  const submitForm = useCallback(
    (data: EmailFormData) => {
      createDestinationMutation.mutate({
        projectSlug,
        config: { type: 'EMAIL', email: data.email },
      });
    },
    [createDestinationMutation, projectSlug],
  );

  if (createDestinationMutation.data)
    return (
      <Flex stack gap="l">
        <Flex align="center">
          <FeatherIcon icon="check-circle" color="primary" size="m" />
          <H5>Email destination has been created.</H5>
        </Flex>

        <EmailDestinationVerification destination={createDestinationMutation.data} />
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
              {...form.register('email', formValidations.email)}
            />
            <Form.Feedback>{form.formState.errors.email?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Flex>
          <Button
            loading={createDestinationMutation.isLoading}
            type="submit"
            stableId={StableId.NEW_DESTINATION_MODAL_CREATE_BUTTON}
          >
            Create
          </Button>
          <Button onClick={props.closeModal} color="neutral" stableId={StableId.NEW_DESTINATION_MODAL_CANCEL_BUTTON}>
            Cancel
          </Button>
        </Flex>
      </Flex>
    </Form.Root>
  );
}
