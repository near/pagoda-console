import type { AuthError } from 'firebase/auth';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button, ButtonLink } from '@/components/lib/Button';
import * as Form from '@/components/lib/Form';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';

import { Flex } from '../lib/Flex';
import { TextLink } from '../lib/TextLink';
import { ForgotPasswordModal } from '../modals/ForgotPasswordModal';

interface Props {
  isAuthenticating: boolean;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
}

interface EmailAuthFormData {
  email: string;
  password: string;
}

export function EmailForm({ isAuthenticating, setIsAuthenticating }: Props) {
  const { register, handleSubmit, formState, setError } = useForm<EmailAuthFormData>();
  const [showResetModal, setShowResetModal] = useState(false);

  const signInWithEmail: SubmitHandler<EmailAuthFormData> = async ({ email, password }) => {
    const auth = getAuth();
    setIsAuthenticating(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      analytics.track('DC Login using name + password', {
        status: 'success',
      });
    } catch (e) {
      setIsAuthenticating(false);

      const error = e as AuthError;
      const errorCode = error.code;

      analytics.track('DC Login using name + password', {
        status: 'failure',
        error: errorCode,
      });

      switch (errorCode) {
        case 'auth/user-not-found':
          setError('email', {
            message: 'User not found',
          });
          break;
        case 'auth/wrong-password':
          setError('password', {
            message: 'Incorrect password',
          });
          break;
        case 'auth/too-many-requests':
          // hardcode message from Firebase for the time being
          setError('password', {
            message:
              'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.',
          });
          break;
        default:
          // TODO
          setError('password', {
            message: 'Something went wrong',
          });
          break;
      }
    }
  };

  const isSubmitting = formState.isSubmitting || isAuthenticating;

  return (
    <>
      <Form.Root disabled={isSubmitting} onSubmit={handleSubmit(signInWithEmail)}>
        <Flex stack gap="m" align="center">
          <Form.Group>
            <Form.Label htmlFor="email">Email</Form.Label>
            <Form.Input
              id="email"
              type="email"
              placeholder="name@example.com"
              isInvalid={!!formState.errors.email}
              {...register('email', formValidations.email)}
            />
            <Form.Feedback>{formState.errors.email?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="password">Password</Form.Label>
            <Form.Input
              id="password"
              type="password"
              placeholder="Password"
              isInvalid={!!formState.errors.password}
              {...register('password', formValidations.password)}
            />
            <Form.Feedback>{formState.errors.password?.message}</Form.Feedback>
          </Form.Group>

          <Button type="submit" stretch>
            Continue
          </Button>

          <Link href="/register" passHref>
            <ButtonLink color="neutral" stretch onClick={() => analytics.track('DC Clicked Sign Up on Login')}>
              Sign Up
            </ButtonLink>
          </Link>

          <TextLink as="button" type="button" color="neutral" onClick={() => setShowResetModal(true)}>
            Forgot Password?
          </TextLink>
        </Flex>
      </Form.Root>

      <ForgotPasswordModal show={showResetModal} setShow={setShowResetModal} />
    </>
  );
}
