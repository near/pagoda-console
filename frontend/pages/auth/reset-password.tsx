import { useMutation } from '@tanstack/react-query';
import type { AuthError } from 'firebase/auth';
import { confirmPasswordReset, getAuth, signInWithEmailAndPassword, verifyPasswordResetCode } from 'firebase/auth';
import router from 'next/router';
import * as React from 'react';
import type { SubmitHandler } from 'react-hook-form';

import { Flex } from '@/components/lib/Flex';
import { H2 } from '@/components/lib/Heading';
import { openToast } from '@/components/lib/Toast';
import type { RegisterFormData } from '@/modules/core/components/ResetPasswordForm';
import { ResetPasswordForm } from '@/modules/core/components/ResetPasswordForm';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';

interface Props {
  verifyCode: string | null;
}

const ResetPassword = ({ verifyCode }: Props) => {
  const handleInvalidSubmit = React.useCallback(() => {
    analytics.track('DC Submitted reset password form');
    analytics.track('DC Reset password form validation failed');
    return false;
  }, []);

  const resetPassword: SubmitHandler<RegisterFormData> = (form) => {
    analytics.track('DC Submitted reset password form');
    resetPasswordMutation.mutate(form);
  };

  const resetPasswordMutation = useMutation<void, AuthError, RegisterFormData>(
    async ({ password }) => {
      const auth = getAuth();
      const actionCode = verifyCode!;

      const accountEmail = await verifyPasswordResetCode(auth, actionCode);

      await confirmPasswordReset(auth, actionCode, password);
      openToast({
        type: 'success',
        title: 'Password Reset',
        description: 'Logging in...',
        duration: 5000,
      });
      // * This call shouldn't fail since we just reset password successfully.
      await signInWithEmailAndPassword(auth, accountEmail, password);
      router.push('/projects');
    },
    {
      onSuccess: () => {
        analytics.track('DC Signed up with email', { status: 'success' });
      },
      onError: (error) => {
        console.error('error: ', error.code);
        switch ((error as any).code) {
          case 'auth/invalid-action-code':
            handleMutationError({
              error,
              eventLabel: 'DC Reset Password',
              toastTitle: 'Invalid action code or this code expired',
            });
            break;
          default:
            handleMutationError({
              error,
              eventLabel: 'DC Reset Password',
              toastTitle: 'Failed to reset password.',
            });
        }
      },
    },
  );

  return (
    <Flex stack gap="l">
      <H2>Reset password</H2>

      <ResetPasswordForm
        submitForm={resetPassword}
        handleInvalidSubmit={handleInvalidSubmit}
        disabled={resetPasswordMutation.isLoading}
      />
    </Flex>
  );
};

export default ResetPassword;
