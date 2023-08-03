import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { PasswordInput } from '@/components/lib/PasswordInput';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';

export interface RegisterFormData {
  password: string;
  passwordConfirm: string;
}

export function ResetPasswordForm({ submitForm, handleInvalidSubmit, disabled }) {
  const { register, handleSubmit, formState, watch, control } = useForm<RegisterFormData>();
  return (
    <Form.Root disabled={disabled} onSubmit={handleSubmit(submitForm, handleInvalidSubmit)}>
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

        <Button stableId={StableId.REGISTER_RESET_PASSWORD_BUTTON} stretch type="submit" loading={disabled}>
          Reset Password
        </Button>
      </Flex>
    </Form.Root>
  );
}
