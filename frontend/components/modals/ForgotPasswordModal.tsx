import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import * as Dialog from '@/components/lib/Dialog';
import * as Form from '@/components/lib/Form';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';

import { Button } from '../lib/Button';
import { FeatherIcon } from '../lib/FeatherIcon';
import { Flex } from '../lib/Flex';
import { Font } from '../lib/Font';
import { P } from '../lib/Paragraph';

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

          <P>
            A reset email has been sent to your address: <Font color="text1">{getValues('email')}</Font>
          </P>

          <Button onClick={() => setShow(false)}>Okay</Button>
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

          <Flex justify="end">
            <Button onClick={() => setShow(false)} color="neutral">
              Cancel
            </Button>
            <Button type="submit">Send</Button>
          </Flex>
        </Flex>
      )}
    </Form.Root>
  );
};

export const ForgotPasswordModal = (props: Props) => {
  return (
    <Dialog.Root open={props.show} onOpenChange={props.setShow}>
      <Dialog.Content title="Password Reset" size="small">
        {/* The modal content is broken out in to its own component so
        that we'll have a fresh instance each time this modal opens.
        Otherwise, we'd have to worry about manually resetting the state
        and form each time it opened or closed. */}

        <ModalContent {...props} />
      </Dialog.Content>
    </Dialog.Root>
  );
};
