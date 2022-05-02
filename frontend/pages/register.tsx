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
import { Alert, Button, Form } from 'react-bootstrap';
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { simpleLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const onFocus = () => {
  console.log('Tab is in focus');
  getAuth().currentUser?.reload();
};

interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const Register: NextPageWithLayout = () => {
  const { getValues, register, handleSubmit, formState, watch } = useForm<RegisterFormData>();
  const [errorAlert, setErrorAlert] = useState<string | null>();

  const router = useRouter();

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
        router.push('/pick-project');
        console.log('verified');
      }
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, [getValues, router]);

  useEffect(() => {
    router.prefetch('/verification');
    router.prefetch('/pick-project');
  }, []);

  useEffect(() => {
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleInvalidSubmit: SubmitErrorHandler<RegisterFormData> = () => {
    analytics.track('DC Submitted email registration form');
    analytics.track('DC Registration form validation failed');
  };

  const signUpWithEmail: SubmitHandler<RegisterFormData> = async ({ email, password }) => {
    try {
      setErrorAlert('');
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
          setErrorAlert('Email is already in use');
          break;
        default:
          setErrorAlert(errorMessage);
      }

      analytics.track('DC Signed up with email', {
        status: 'failure',
        error: errorCode,
      });
    }
  };

  const isSubmitting = formState.isSubmitting || formState.isSubmitSuccessful;

  return (
    <div className="pageContainer">
      <Form noValidate onSubmit={handleSubmit(signUpWithEmail, handleInvalidSubmit)}>
        <fieldset disabled={isSubmitting}>
          <div className="formFields">
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                isInvalid={!!formState.errors.email}
                placeholder="name@example.com"
                {...register('email', formValidations.email)}
              />
              <Form.Control.Feedback type="invalid">{formState.errors.email?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                isInvalid={!!formState.errors.password}
                placeholder="6+ characters"
                {...register('password', formValidations.password)}
              />
              <Form.Control.Feedback type="invalid">{formState.errors.password?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formBasicConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
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
              <Form.Control.Feedback type="invalid">{formState.errors.passwordConfirm?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formBasicDisplayName">
              <Form.Label>Display Name</Form.Label>
              <Form.Control
                isInvalid={!!formState.errors.displayName}
                placeholder="John Nearian"
                {...register('displayName', formValidations.displayName)}
              />
              <Form.Control.Feedback type="invalid">{formState.errors.displayName?.message}</Form.Control.Feedback>
            </Form.Group>
          </div>

          <Button variant="primary" type="submit">
            Sign Up
          </Button>
        </fieldset>
      </Form>

      {errorAlert && (
        <div className="alertContainer">
          <Alert variant="danger">{errorAlert}</Alert>
        </div>
      )}

      <hr />

      <Link href="/">
        <a>I already have an account</a>
      </Link>

      <style jsx>{`
        .pageContainer {
          display: flex;
          flex-direction: column;
          width: 20.35rem;
        }
        .formFields {
          display: flex;
          flex-direction: column;
          row-gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .pageContainer :global(.btn) {
          width: 100%;
        }
        a {
          margin: 0 auto;
        }
        .alertContainer {
          margin-top: 1.25rem;
        }
      `}</style>
    </div>
  );
};

Register.getLayout = simpleLayout;

export default Register;
