import { useMutation } from '@tanstack/react-query';
import type { AuthError } from 'firebase/auth';
import { confirmPasswordReset, getAuth, signInWithEmailAndPassword, verifyPasswordResetCode } from 'firebase/auth';
import { useRouter } from 'next/router';
import * as React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';

import { SimpleLayout } from '@/components/layouts/SimpleLayout';
import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H2 } from '@/components/lib/Heading';
import { PasswordInput } from '@/components/lib/PasswordInput';
import { Section } from '@/components/lib/Section';
import { openToast } from '@/components/lib/Toast';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

interface RegisterFormData {
  password: string;
  passwordConfirm: string;
}

const ResetPassword = () => {
  const { register, handleSubmit, formState, watch, control } = useForm<RegisterFormData>();
  const [passwordResetSuccessfully, setPasswordResetSuccessfully] = React.useState(false);
  const code = useRouteParam('oobCode');
  const router = useRouter();

  React.useEffect(() => {
    if (passwordResetSuccessfully) {
      setTimeout(() => {
        router.push('/projects');
      }, 2000);
    }
  }, [passwordResetSuccessfully, router]);

  const handleInvalidSubmit = React.useCallback(() => {
    analytics.track('DC Submitted reset password form');
    analytics.track('DC Reset password form validation failed');
    return false;
  }, []);

  const resetPasswordMutation = useMutation<void, AuthError, RegisterFormData>(
    async ({ password }) => {
      const auth = getAuth();
      const actionCode = code!;

      const accountEmail = await verifyPasswordResetCode(auth, actionCode);

      await confirmPasswordReset(auth, actionCode, password);
      openToast({
        type: 'success',
        title: 'Password Reset',
        description: 'Logging in...',
        duration: 5000,
      });
      // * This call shouldn't fail since we just reset password successfully.
      signInWithEmailAndPassword(auth, accountEmail, password);
      setPasswordResetSuccessfully(true);
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

  const resetPassword: SubmitHandler<RegisterFormData> = (form) => {
    analytics.track('DC Submitted reset password form');
    resetPasswordMutation.mutate(form);
  };

  return (
    <SimpleLayout>
      <Section>
        <Container size="xs">
          <Flex stack gap="l">
            <H2>Reset password</H2>

            <Form.Root
              disabled={resetPasswordMutation.isLoading}
              onSubmit={handleSubmit(resetPassword, handleInvalidSubmit)}
            >
              <Flex stack gap="l">
                <Form.Group>
                  <Form.Label htmlFor="password">Enter new password</Form.Label>
                  <Controller
                    name="password"
                    control={control}
                    rules={formValidations.strongPassword}
                    render={({ field }) => (
                      <PasswordInput
                        field={field}
                        id="password"
                        type="password"
                        isInvalid={!!formState.errors.password}
                        placeholder="8+ characters"
                        stableId={StableId.REGISTER_PASSWORD_INPUT}
                      />
                    )}
                  />
                  <Form.Feedback>{formState.errors.password?.message}</Form.Feedback>
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="confirmPassword">Confirm Password</Form.Label>
                  <Form.Input
                    id="confirmPassword"
                    type="password"
                    isInvalid={!!formState.errors.passwordConfirm}
                    stableId={StableId.REGISTER_CONFIRM_PASSWORD_INPUT}
                    {...register('passwordConfirm', {
                      required: 'Please confirm your password',
                      validate: (value) => {
                        if (watch('password') !== value) {
                          return 'Passwords do not match';
                        }
                      },
                    })}
                  />
                  <Form.Feedback>{formState.errors.passwordConfirm?.message}</Form.Feedback>
                </Form.Group>

                <Button
                  stableId={StableId.REGISTER_RESET_PASSWORD_BUTTON}
                  stretch
                  type="submit"
                  loading={resetPasswordMutation.isLoading}
                >
                  Reset Password
                </Button>
              </Flex>
            </Form.Root>
          </Flex>
        </Container>
      </Section>
    </SimpleLayout>
  );
};

export default ResetPassword;
