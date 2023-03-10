# Password Input

Use this component when you need to allow users to enter strong passwords. This component must be used in conjunction with React Hook Form's `Controller` component and `strongPassword` validation rule.

```tsx
import { Controller, useForm } from 'react-hook-form';
import { formValidations } from '@/utils/constants';
import * as Form from '@/components/lib/Form';

interface FormData {
  myNearAmount: string;
}

...

const form = useForm<FormData>();

...

<Form.Root onSubmit={form.handleSubmit(submitForm)}>
  <Form.Group>
    <Controller
      name="password"
      control={form.control}
      rules={formValidations.strongPassword}
      render={({ field }) => (
        <PasswordInput
          field={field}
          id="password"
          type="password"
          isInvalid={!!formState.errors.password}
          placeholder="8+ characters"
        />
      )}
    />
    <Form.Feedback>{form.formState.errors.password?.message}</Form.Feedback>
  </Form.Group>
</Form.Root>
