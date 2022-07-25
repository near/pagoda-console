# Near Input

Use this component when you need to allow users to enter an amount of NEAR or yoctoNEAR. This component must be used in conjunction with React Hook Form's `Controller` component. Due to yoctoNEAR being a potentially massive number (U128 max value), the input value will be interpreted as a `string` - not a `number`.

## Example

```tsx
import { Controller, useForm } from 'react-hook-form';
import * as Form from '@/components/lib/Form';
import { NearInput } from '@/components/lib/NearInput';
import { validateMaxValueU128 } from '@/utils/validations';

interface FormData {
  myFieldName: string;
}

...

const form = useForm<FormData>();

...

<Form.Root onSubmit={form.handleSubmit(submitForm)}>
  <Form.Group>
    <Controller
      name="myFieldName"
      control={form.control}
      rules={{
        required: 'Please enter an amount',
        validate: {
          maxValue: validateMaxValueU128,
        },
      }}
      render={({ field }) => (
        <NearInput
          label="Amount"
          field={field}
          isInvalid={!!form.formState.errors.myFieldName}
        />
      )}
    />
    <Form.Feedback>{form.formState.errors.myFieldName?.message}</Form.Feedback>
  </Form.Group>
</Form.Root>
```

## Big Number

When needing to perform math operations on the value, you'll need to use [bn.js](https://github.com/indutny/bn.js). Here's an example of checking if `valueOne` is less than `valueTwo`:

```tsx
import { BN } from 'bn.js';

const isValid = new BN(valueOne || '', 10).lt(new BN(valueTwo || '', 10));
```
