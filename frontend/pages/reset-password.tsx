import { Controller, useForm } from 'react-hook-form';

import { SimpleLayout } from '@/components/layouts/SimpleLayout';
import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H2 } from '@/components/lib/Heading';
import { PasswordInput } from '@/components/lib/PasswordInput';
import { Section } from '@/components/lib/Section';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';

interface RegisterFormData {
  password: string;
  passwordConfirm: string;
}

const ResetPassword = () => {
  const { register, formState, watch, control } = useForm<RegisterFormData>();
  return (
    <SimpleLayout>
      <Section>
        <Container size="xs">
          <Flex stack gap="l">
            <H2>Reset password</H2>

            <Form.Root
            // onSubmit={}
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
                  stableId={StableId.RESET_PASSWORD_BUTTON}
                  stretch
                  type="submit"
                  // loading={}
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
