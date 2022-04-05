// TODO
// Instead of this being a dedicated component, we should have a version of CenterModal which takes
// custom children

import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import analytics from '@/utils/analytics';
import { formRegex } from '@/utils/constants';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const { register, handleSubmit, formState, setError, setValue } = useForm<ForgotPasswordFormData>();
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

  function close() {
    onHide();
    setHasSent(false);
    setValue('email', '');
  }

  return (
    <Modal show={show} onHide={close} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Form noValidate onSubmit={handleSubmit(sendPasswordReset)}>
        <fieldset disabled={formState.isSubmitting}>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Password Reset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!hasSent ? (
              <Form.Group controlId="formForgotEmail">
                <Form.Label>Please enter your email address:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  isInvalid={!!formState.errors.email}
                  {...register('email', {
                    required: 'Please enter an email address',
                    pattern: {
                      value: formRegex.email,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
                <Form.Control.Feedback type="invalid">{formState.errors.email?.message}</Form.Control.Feedback>
              </Form.Group>
            ) : (
              'Sent!'
            )}
          </Modal.Body>
          {!hasSent && (
            <Modal.Footer>
              <Button onClick={close} variant="secondary">
                Cancel
              </Button>
              <Button type="submit">Send</Button>
            </Modal.Footer>
          )}
        </fieldset>
      </Form>
    </Modal>
  );
}
