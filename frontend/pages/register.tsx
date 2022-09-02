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
import { useEffect, useState } from 'react';
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H2 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { TextLink } from '@/components/lib/TextLink';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useSimpleLayout } from '@/hooks/layouts';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { signInRedirectHandler } from '@/utils/helpers';
import type { NextPageWithLayout } from '@/utils/types';

const Register: NextPageWithLayout = () => {
  return (
    <Container size="xs">
      <Flex stack gap="l">
        <H2>Sign Up</H2>
        <RegisterForm />
      </Flex>
    </Container>
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
  const { getValues, register, handleSubmit, formState, watch } = useForm<RegisterFormData>();
  const [registerError, setRegisterError] = useState<string | null>();
  const router = useRouter();

  useEffect(() => {
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    router.prefetch('/verification');
    router.prefetch('/pick-project');
  }, [router]);

  useEffect(() => {
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
        signInRedirectHandler(router, '/pick-project');
      }
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, [getValues, router]);

  const handleInvalidSubmit: SubmitErrorHandler<RegisterFormData> = () => {
    analytics.track('DC Submitted email registration form');
    analytics.track('DC Registration form validation failed');
    return false;
  };

  const signUpWithEmail: SubmitHandler<RegisterFormData> = async ({ email, password }) => {
    try {
      setRegisterError('');
      analytics.track('DC Submitted email registration form');
      const auth = getAuth();
      const registerResult = await createUserWithEmailAndPassword(auth, email, password);

      try {
        analytics.alias(registerResult.user.uid);
        analytics.track('DC Signed up with email', {
          status: 'success',
        });
      } catch (e) {
        // silently fail
      }
    } catch (e) {
      const error = e as AuthError;
      const errorCode = error.code;
      const errorMessage = error.message;
      // TODO determine error handling
      console.error(`${errorCode}: ${errorMessage}`);

      switch (errorCode) {
        case 'auth/email-already-in-use':
          setRegisterError('Email is already in use');
          break;
        default:
          setRegisterError(errorMessage);
      }

      analytics.track('DC Signed up with email', {
        status: 'failure',
        error: errorCode,
      });
    }
  };

  return (
    <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(signUpWithEmail, handleInvalidSubmit)}>
      <Flex stack gap="l">
        <Flex stack>
          <Form.Group>
            <Form.Label htmlFor="email">Email address</Form.Label>
            <Form.Input
              id="email"
              type="email"
              isInvalid={!!formState.errors.email}
              placeholder="name@example.com"
              {...register('email', formValidations.email)}
            />
            <Form.Feedback>{formState.errors.email?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="password">Password</Form.Label>
            <Form.Input
              id="password"
              type="password"
              isInvalid={!!formState.errors.password}
              placeholder="6+ characters"
              {...register('password', formValidations.password)}
            />
            <Form.Feedback>{formState.errors.password?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="confirmPassword">Confirm Password</Form.Label>
            <Form.Input
              id="confirmPassword"
              type="password"
              isInvalid={!!formState.errors.passwordConfirm}
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
              {...register('displayName', formValidations.displayName)}
            />
            <Form.Feedback>{formState.errors.displayName?.message}</Form.Feedback>
          </Form.Group>
        </Flex>

        <ErrorModal error={registerError} setError={setRegisterError} />

        <Button stretch type="submit" loading={formState.isSubmitting}>
          Sign Up
        </Button>

        <HR />

        <Link href="/" passHref>
          <TextLink color="neutral" css={{ margin: '0 auto' }}>
            I already have an account
          </TextLink>
        </Link>
      </Flex>
    </Form.Root>
  );
}

Register.getLayout = useSimpleLayout;

export default Register;
