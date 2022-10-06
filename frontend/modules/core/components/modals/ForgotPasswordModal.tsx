import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { TextButton } from '@/components/lib/TextLink';
import analytics from '@/utils/analytics';
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
  const { register, handleSubmit, formState, setError, getValues } = useForm<ForgotPasswordFormData>();
  const [hasSent, setHasSent] = useState(false);

  const sendPasswordReset: SubmitHandler<ForgotPasswordFormData> = async ({ email }) => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      analytics.track('DC Forgot Password', {
        status: 'success',
      });
      setHasSent(true);
    } catch (e: any) {
      console.error(e);

      analytics.track('DC Forgot Password', {
        status: 'failure',
        error: e.code,
      });

      switch (e.code) {
        case 'auth/missing-email':
        case 'auth/invalid-email':
          setError('email', {
            message: 'Please enter a valid email address',
          });
          break;
        case 'auth/user-not-found':
          setError('email', {
            message: 'User not found',
          });
          break;
        default:
          setError('email', {
            message: 'Something went wrong',
          });
          break;
      }
    }
  };

  return (
    <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(sendPasswordReset)}>
      {hasSent ? (
        <Flex stack align="center" css={{ textAlign: 'center' }}>
          <FeatherIcon icon="check-circle" color="success" size="l" />

          <Text>
            A reset email has been sent to your address:{' '}
            <Text as="span" color="text1">
              {getValues('email')}
            </Text>
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
            <Form.Feedback>{formState.errors.email?.message}</Form.Feedback>
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
