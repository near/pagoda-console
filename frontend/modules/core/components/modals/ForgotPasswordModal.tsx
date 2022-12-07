import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { TextButton } from '@/components/lib/TextLink';
import { useMutation } from '@/hooks/mutation';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';

interface ForgotPasswordFormData {
  email: string;
}

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}

const ModalContent = ({ setShow }: Props) => {
  const { register, handleSubmit, formState } = useForm<ForgotPasswordFormData>();
  const resetPasswordMutation = useMutation('/users/resetPassword', { unauth: true });

  const resetPasswordError =
    resetPasswordMutation.status === 'error'
      ? (resetPasswordMutation.error as any).code === 400
        ? 'Please enter a valid email address'
        : 'Something went wrong'
      : undefined;
  const resetPassword = useCallback<SubmitHandler<ForgotPasswordFormData>>(
    (form) => resetPasswordMutation.mutate(form),
    [resetPasswordMutation],
  );

  return (
    <Form.Root disabled={resetPasswordMutation.isLoading} onSubmit={handleSubmit(resetPassword)}>
      {resetPasswordMutation.status === 'success' ? (
        <Flex stack align="center" css={{ textAlign: 'center' }}>
          <FeatherIcon icon="check-circle" color="success" size="l" />

          <Text>
            If an account is associated to this email, you will receive an email with a link to reset your password.
          </Text>

          <Button stableId={StableId.FORGOT_PASSWORD_MODAL_FINISH_BUTTON} onClick={() => setShow(false)}>
            Okay
          </Button>
        </Flex>
      ) : (
        <Flex stack>
          <Form.Group gap="s">
            <Form.Label htmlFor="forgotEmail">Please enter your email address:</Form.Label>
            <Form.Input
              id="forgotEmail"
              type="email"
              placeholder="name@example.com"
              isInvalid={!!formState.errors.email}
              {...register('email', formValidations.email)}
            />
            <Form.Feedback>{resetPasswordError ?? formState.errors.email?.message}</Form.Feedback>
          </Form.Group>

          <Flex justify="spaceBetween" align="center">
            <Button stableId={StableId.FORGOT_PASSWORD_MODAL_SEND_RESET_EMAIL_BUTTON} type="submit">
              Send
            </Button>
            <TextButton
              stableId={StableId.FORGOT_PASSWORD_MODAL_CANCEL_BUTTON}
              color="neutral"
              onClick={() => setShow(false)}
            >
              Cancel
            </TextButton>
          </Flex>
        </Flex>
      )}
    </Form.Root>
  );
};

export const ForgotPasswordModal = (props: Props) => {
  return (
    <Dialog.Root open={props.show} onOpenChange={props.setShow}>
      <Dialog.Content title="Password Reset" size="s">
        {/* The modal content is broken out in to its own component so
        that we'll have a fresh instance each time this modal opens.
        Otherwise, we'd have to worry about manually resetting the state
        and form each time it opened or closed. */}

        <ModalContent {...props} />
      </Dialog.Content>
    </Dialog.Root>
  );
};
