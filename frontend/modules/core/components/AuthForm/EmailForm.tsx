import type { AuthError, UserCredential } from 'firebase/auth';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, ButtonLink } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { TextButton } from '@/components/lib/TextLink';
import { ErrorModal } from '@/components/modals/ErrorModal';
import type { UseMutationResult } from '@/hooks/raw-mutation';
import { ForgotPasswordModal } from '@/modules/core/components/modals/ForgotPasswordModal';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';

interface Props {
  mutation: UseMutationResult<UserCredential, AuthError, { email: string; password: string }>;
  externalLoading: boolean;
}

interface EmailAuthFormData {
  email: string;
  password: string;
}

export function EmailForm({ mutation: signInViaEmailMutation, externalLoading }: Props) {
  const { register, handleSubmit, formState } = useForm<EmailAuthFormData>();
  const [showResetModal, setShowResetModal] = useState(false);

  const signInError = useMemo(() => {
    if (!signInViaEmailMutation.error) {
      return undefined;
    }

    switch (signInViaEmailMutation.error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        // hardcode message from Firebase for the time being
        return 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
      default:
        // TODO
        return 'Something went wrong.';
    }
  }, [signInViaEmailMutation.error]);

  return (
    <>
      <Form.Root
        disabled={signInViaEmailMutation.isLoading || externalLoading}
        onSubmit={handleSubmit(signInViaEmailMutation.mutate)}
      >
        <Flex stack gap="l" align="center">
          <Flex stack gap="m">
            <Form.Group>
              <Form.Label htmlFor="email">Email</Form.Label>
              <Form.Input
                id="email"
                type="email"
                placeholder="name@example.com"
                isInvalid={!!formState.errors.email}
                stableId={StableId.AUTHENTICATION_EMAIL_FORM_EMAIL_INPUT}
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
                stableId={StableId.AUTHENTICATION_EMAIL_FORM_PASSWORD_INPUT}
                {...register('password', formValidations.password)}
              />
              <Form.Feedback>{formState.errors.password?.message}</Form.Feedback>
            </Form.Group>

            <Button
              stableId={StableId.AUTHENTICATION_EMAIL_FORM_SIGN_IN_BUTTON}
              type="submit"
              stretch
              loading={signInViaEmailMutation.isLoading}
            >
              Continue
            </Button>

            <Link href="/register" passHref>
              <ButtonLink
                stableId={StableId.AUTHENTICATION_EMAIL_FORM_SIGN_UP_BUTTON}
                color="neutral"
                stretch
                onClick={() => analytics.track('DC Clicked Sign Up on Login')}
              >
                Sign Up
              </ButtonLink>
            </Link>
          </Flex>

          <TextButton
            stableId={StableId.AUTHENTICATION_EMAIL_FORM_FORGOT_PASSWORD_BUTTON}
            color="neutral"
            size="s"
            onClick={() => setShowResetModal(true)}
          >
            Forgot Password?
          </TextButton>
        </Flex>
      </Form.Root>

      <ForgotPasswordModal show={showResetModal} setShow={setShowResetModal} />

      <ErrorModal error={signInError} resetError={signInViaEmailMutation.reset} />
    </>
  );
}
