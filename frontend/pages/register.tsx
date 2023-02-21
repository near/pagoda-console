import { useMutation } from '@tanstack/react-query';
import type { AuthError } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H2 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { TextLink } from '@/components/lib/TextLink';
import { Tooltip } from '@/components/lib/Tooltip';
import { useSignedInHandler } from '@/hooks/auth';
import { useSimpleLayout } from '@/hooks/layouts';
import { usePublicMode } from '@/hooks/public';
import analytics from '@/utils/analytics';
import { formRegex, formValidations } from '@/utils/constants';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const Register: NextPageWithLayout = () => {
  return (
    <Section>
      <Container size="xs">
        <Flex stack gap="l">
          <H2>Sign Up</H2>
          <RegisterForm />
        </Flex>
      </Container>
    </Section>
  );
};

const onFocus = () => {
  getAuth().currentUser?.reload();
};

interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export function RegisterForm() {
  const { getValues, register, handleSubmit, formState, watch, setError } = useForm<RegisterFormData>();
  const router = useRouter();
  const signedInHandler = useSignedInHandler();
  const { publicModeIsActive } = usePublicMode();
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  React.useEffect(() => {
    router.prefetch('/verification');
    router.prefetch('/pick-project');
  }, [router]);

  React.useEffect(() => {
    const unregisterAuthObserver = onAuthStateChanged(getAuth(), async (user) => {
      if (user && !user.emailVerified) {
        try {
          await updateProfile(user, {
            displayName: getValues('displayName'),
          });

          await sendEmailVerification(user);
          router.push('/verification');
        } catch (e) {
          // TODO
          console.error(e);
        }
      } else if (user) {
        // If the user is already verified and they go to /register, let's reroute them.
        signedInHandler('/pick-project');
      }
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, [getValues, router, signedInHandler]);

  const handleInvalidSubmit = React.useCallback(() => {
    analytics.track('DC Submitted email registration form');
    analytics.track('DC Registration form validation failed');
    return false;
  }, []);

  const signUpWithEmailMutation = useMutation<void, AuthError, RegisterFormData>(
    async ({ email, password }) => {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      if (publicModeIsActive) {
        analytics.track(`DC Public Mode Sign Up`);
      }
    },
    {
      onSuccess: () => {
        analytics.track('DC Signed up with email', { status: 'success' });
      },
      onError: (error) => {
        switch ((error as any).code) {
          case 'auth/email-already-in-use':
            setError('email', {
              message: 'Email is already in use',
            });
            break;
          default:
            handleMutationError({
              error,
              eventLabel: 'DC Signed up with email',
              toastTitle: 'Failed to register account.',
            });
        }
      },
    },
  );

  const signUpWithEmail: SubmitHandler<RegisterFormData> = (form) => {
    analytics.track('DC Submitted email registration form');
    signUpWithEmailMutation.mutate(form);
  };

  const passwordValue = watch('password');

  return (
    <Form.Root
      disabled={signUpWithEmailMutation.isLoading}
      onSubmit={handleSubmit(signUpWithEmail, handleInvalidSubmit)}
    >
      <Flex stack gap="l">
        <Flex stack>
          <Form.Group>
            <Form.Label htmlFor="email">Email address</Form.Label>
            <Form.Input
              id="email"
              type="email"
              isInvalid={!!formState.errors.email}
              placeholder="name@example.com"
              stableId={StableId.REGISTER_EMAIL_INPUT}
              {...register('email', formValidations.email)}
            />
            <Form.Feedback>{formState.errors.email?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="password">Password</Form.Label>
            <Tooltip
              root={{
                open: isFocused && !!passwordValue,
              }}
              content={
                <Flex stack>
                  <span>Your password should contain:</span>
                  <Flex align="center">
                    <FeatherIcon
                      icon={formRegex.strongPassword.minLength.test(passwordValue) ? 'check-circle' : 'alert-circle'}
                      color={formRegex.strongPassword.minLength.test(passwordValue) ? 'success' : 'warning'}
                    />{' '}
                    a minimum of 8 characters
                  </Flex>
                  <Flex align="center">
                    <FeatherIcon
                      icon={
                        formRegex.strongPassword.containNumber.test(passwordValue) ? 'check-circle' : 'alert-circle'
                      }
                      color={formRegex.strongPassword.containNumber.test(passwordValue) ? 'success' : 'warning'}
                    />{' '}
                    at least 1 numeric character
                  </Flex>
                  <Flex align="center">
                    <FeatherIcon
                      icon={formRegex.strongPassword.lowerCase.test(passwordValue) ? 'check-circle' : 'alert-circle'}
                      color={formRegex.strongPassword.lowerCase.test(passwordValue) ? 'success' : 'warning'}
                    />{' '}
                    at least 1 lowercase alphabet character
                  </Flex>
                  <Flex align="center">
                    <FeatherIcon
                      icon={formRegex.strongPassword.upperCase.test(passwordValue) ? 'check-circle' : 'alert-circle'}
                      color={formRegex.strongPassword.upperCase.test(passwordValue) ? 'success' : 'warning'}
                    />{' '}
                    at least 1 uppercase alphabet character
                  </Flex>
                  <Flex align="center">
                    <FeatherIcon
                      icon={
                        formRegex.strongPassword.specialCharacter.test(passwordValue) ? 'check-circle' : 'alert-circle'
                      }
                      color={formRegex.strongPassword.specialCharacter.test(passwordValue) ? 'success' : 'warning'}
                    />{' '}
                    at least 1 special character like !, @, %, &, *
                  </Flex>
                </Flex>
              }
            >
              <Form.Input
                id="password"
                type="password"
                isInvalid={!!formState.errors.password}
                placeholder="8+ characters"
                stableId={StableId.REGISTER_PASSWORD_INPUT}
                {...register('password', formValidations.strongPassword)}
                onBlur={() => {
                  setIsFocused(false);
                }}
                onFocus={() => {
                  setIsFocused(true);
                }}
              />
            </Tooltip>
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

          <Form.Group>
            <Form.Label htmlFor="displayName">Display Name</Form.Label>
            <Form.Input
              id="displayName"
              isInvalid={!!formState.errors.displayName}
              placeholder="John Nearian"
              stableId={StableId.REGISTER_DISPLAY_NAME_INPUT}
              {...register('displayName', formValidations.displayName)}
            />
            <Form.Feedback>{formState.errors.displayName?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <Button
          stableId={StableId.REGISTER_SIGN_UP_BUTTON}
          stretch
          type="submit"
          loading={signUpWithEmailMutation.isLoading}
        >
          Sign Up
        </Button>

        <HR />

        <Link href="/" passHref>
          <TextLink stableId={StableId.REGISTER_SIGN_IN_LINK} color="neutral" css={{ margin: '0 auto' }}>
            I already have an account
          </TextLink>
        </Link>
      </Flex>
    </Form.Root>
  );
}

Register.getLayout = useSimpleLayout;

export default Register;
