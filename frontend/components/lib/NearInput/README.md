# NEAR Input

Use this component when you need to allow users to enter an amount of NEAR or yoctoNEAR. This component must be used in conjunction with React Hook Form's `Controller` component. Due to yoctoNEAR being a potentially massive number (U128 max value), the input value will be interpreted as a `string` - not a `number`.

## NEAR

To allow users to enter an amount of NEAR (up to 24 decimal places), omit the `yocto` prop on `NearInput` (or set it to false):

```tsx
import { Controller, useForm } from 'react-hook-form';
import * as Form from '@/components/lib/Form';
import { NearInput } from '@/components/lib/NearInput';
import { validateMaxNearU128, validateMaxNearDecimalLength } from '@/utils/validations';

interface FormData {
  myNearAmount: string;
}

...

const form = useForm<FormData>();

...

<Form.Root onSubmit={form.handleSubmit(submitForm)}>
  <Form.Group>
    <Controller
      name="myNearAmount"
      control={form.control}
      rules={{
        required: 'Please enter an amount',
        validate: {
          maxDecimals: validateMaxNearDecimalLength,
          maxValue: validateMaxNearU128,
        },
      }}
      render={({ field }) => (
        <NearInput
          label="Amount"
          field={field}
          isInvalid={!!form.formState.errors.myNearAmount}
        />
      )}
    />
    <Form.Feedback>{form.formState.errors.myNearAmount?.message}</Form.Feedback>
  </Form.Group>
</Form.Root>
```

## yoctoNEAR

To allow users to enter an amount of yoctoNEAR (integer), enable the `yocto` prop on `NearInput`:

```tsx
import { Controller, useForm } from 'react-hook-form';
import * as Form from '@/components/lib/Form';
import { NearInput } from '@/components/lib/NearInput';
import { validateMaxYoctoU128 } from '@/utils/validations';

interface FormData {
  myYoctoNearAmount: string;
}

...

const form = useForm<FormData>();

...

<Form.Root onSubmit={form.handleSubmit(submitForm)}>
  <Form.Group>
    <Controller
      name="myYoctoNearAmount"
      control={form.control}
      rules={{
        required: 'Please enter an amount',
        validate: {
          maxValue: validateMaxYoctoU128,
        },
      }}
      render={({ field }) => (
        <NearInput
          yocto
          label="Amount"
          field={field}
          isInvalid={!!form.formState.errors.myYoctoNearAmount}
        />
      )}
    />
    <Form.Feedback>{form.formState.errors.myYoctoNearAmount?.message}</Form.Feedback>
  </Form.Group>
</Form.Root>
```

Note that the `validate` rules are different when dealing with `yocto`. Since we don't allow users to enter a decimal for yoctoNEAR, we only need the `validateMaxYoctoU128` rule (not to be confused with `validateMaxNearU128`).

### Big Number

When needing to perform math operations on yoctoNEAR values, you'll need to use [JSBI](https://github.com/GoogleChromeLabs/jsbi). Here's an example of checking if `valueOne` is less than `valueTwo`:

```tsx
import JSBI from 'jsbi';

const isValid = JSBI.lessThan(JSBI.BigInt(valueOne || ''), JSBI.BigInt(valueTwo || '', 10));
```

## Converting

Often times, you'll need to convert from or to yoctoNEAR when loading or submitting a form. You can use our utility methods:

```tsx
import { convertNearToYocto, convertYoctoToNear } from '@/utils/convert-near';
```
