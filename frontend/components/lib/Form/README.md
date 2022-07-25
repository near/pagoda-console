# Form

## Standard Form

When creating a `Form`, you'll usually combine it with [React Hook Form](https://react-hook-form.com/) to manage state and validation like so:

```tsx
import { useForm } from 'react-hook-form';
import * as Form from '@/components/lib/Form';
import { Checkbox, CheckboxGroup } from '@/components/lib/Checkbox';
import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';

...

interface MyForm {
  displayName: string;
  email: string;
  hairColor: string;
}

const { register, handleSubmit, formState } = useForm<MyForm>();

...

<Form.Root onSubmit={handleSubmit((value) => console.log(value) )}>
  <Flex stack gap="l">
    <Form.Group>
      <Form.Label htmlFor="displayName">Display Name</Form.Label>
      <Form.Input
        id="displayName"
        placeholder="eg: John Smith"
        isInvalid={!!formState.errors.displayName}
        {...register('displayName', {
          required: 'You must enter a display name.',
        })}
      />
      <Form.Feedback>{formState.errors.displayName?.message}</Form.Feedback>
    </Form.Group>

    <Form.Group>
      <Form.Label htmlFor="email">Email</Form.Label>
      <Form.Input
        id="email"
        type="email"
        placeholder="eg: john@smith.com"
        isInvalid={!!formState.errors.email}
        {...register('email', {
          required: 'Please enter an email address',
          pattern: {
            value: /^(.+)@(.+)[^.]$/,
            message: 'Please enter a valid email address',
          },
        })}
      />
      <Form.Feedback>{formState.errors.email?.message}</Form.Feedback>
    </Form.Group>

    <Form.Group>
      <Form.Label htmlFor="hairColor">Hair Color</Form.Label>
      <Form.Input
        id="hairColor"
        placeholder="eg: Brown"
        {...register('hairColor')}
      />
    </Form.Group>

    <Button type="submit">Submit</Button>
  </Flex>
</Form.Root>
```

## Horizontal Form

To create a form where the labels and inputs are laid out horizontally in a grid, you can wrap any number of `Groups` with a `HorizontalGroup` like so:

```tsx
<Form.Root>
  <Flex stack gap="l">
    <Form.HorizontalGroup>
      <Form.Label htmlFor="firstInput">Horizontal</Form.Label>
      <Form.Group>
        <Form.Input id="firstInput" />
        <Form.Feedback>...</Form.Feedback>
      </Form.Group>

      <Form.Label htmlFor="secondInput">Horizontal Field Two</Form.Label>
      <Form.Group maxWidth="m">
        <Form.Input id="secondInput" />
        <Form.Feedback>...</Form.Feedback>
      </Form.Group>
    </Form.HorizontalGroup>

    <Button type="submit">Submit</Button>
  </Flex>
</Form.Root>
```

## Groups and Labels

Sometimes it makes sense to semantically group a section of the form. Typically this was done using `<fieldset>` and `<legend>` tags, however the `<fieldset>` tag won't respect certain CSS rules like `display: flex` due to current browser bugs: https://bugs.chromium.org/p/chromium/issues/detail?id=375693#c6

To get around this, we can simply use the `role="group"` and `aria-label="..."` attributes on any `<div>` element to semantically denote a form section like so:

```tsx
<Form.Root>
  ...
  <Flex stack gap="l" role="group" aria-label="First Section">
    <H2>First Section</H2>

    <Form.Group>
      <Form.Label htmlFor="firstInput">Field One</Form.Label>
      <Form.Input id="firstInput" />
      <Form.Feedback>...</Form.Feedback>
    </Form.Group>

    <Form.Group maxWidth="m">
      <Form.Label htmlFor="secondInput">Field Two</Form.Label>
      <Form.Input id="secondInput" />
      <Form.Feedback>...</Form.Feedback>
    </Form.Group>
  </Flex>
  ...
</Form.Root>
```

You could also use `aria-labelledby` instead of `aria-label`:

```tsx
<Flex stack gap="l" role="group" aria-labelledby="headingSection1">
  <H2 id="headingSection1">First Section</H2>
  ...
</Flex>
```

## Floating Labels

To save space and reduce clutter in the UI, most of the time it will make sense to use the `FloatingLabelInput` component over the separate `Input` and `Label` components like so:

```tsx
...
<Form.Group>
  <Form.FloatingLabelInput
    label="Age"
    type="number"
    isInvalid={!!formState.errors.age}
    {...register('age', {
      valueAsNumber: true,
      required: 'Please enter your age',
      min: {
        value: 12,
        message: 'Must be at least 12 years old',
      },
    })}
  />
  <Form.Feedback>{formState.errors.age?.message}</Form.Feedback>
</Form.Group>
...
```

As a bonus, you do not need to worry about passing valid `id` and `htmlFor` values since the label automatically wraps the input - providing proper semantics and accessibility.

You can also pass a value for `placeholder` to show extra context when a user focuses an empty input:

```tsx
<Form.FloatingLabelInput label="Age" placeholder="eg: 35" />
```

## Max Width & Containers

Sometimes it makes sense to wrap your entire form in a `Container` component to set a max width like so:

```tsx
  import { Container } from '@/components/lib/Container';
  ...
  <Container size="s">
    <Form.Root>...</Form.Root>
  </Container>
```

Other times, it makes more sense to set max widths on each `Form.Group` individually:

```tsx
<Form.Root>
  <Form.Group maxWidth="s">
    <Form.Label htmlFor="firstInput">Field One</Form.Label>
    <Form.Input id="firstInput" />
    <Form.Feedback>...</Form.Feedback>
  </Form.Group>

  <Form.Group maxWidth="m">
    <Form.Label htmlFor="secondInput">Field Two</Form.Label>
    <Form.Input id="secondInput" />
    <Form.Feedback>...</Form.Feedback>
  </Form.Group>
</Form.Root>
```

## Checkboxes & Radios

To implement checkboxes or radios in a form, please refer to `Checkbox/README.md` and `CheckboxCard/README.md`.

## Select Dropdowns

To implement a select dropdown in a form, please refer to the `Form Select Dropdown` section in `DropdownMenu/README.md`.

## Number Inputs

Whenever possible, it's easiest to use a native `type="number"` input like so:

```tsx
<Form.Input type="number" />
```

However, a native number input does have limitations and won't support large numbers like U128. Also, it doesn't support formatting (commas). With a combination of helper methods, we can allow users to type in a number value with a regular `type="text"` input:

```tsx
import { numberInputHandler } from '@/utils/input-handlers';
import { sanitizeNumber } from '@/utils/sanitize-number';

...

<Form.Input
  label="Some Number"
  placeholder="eg: 30"
  isInvalid={!!form.formState.errors.myFieldName}
  isNumber
  onInput={numberInputHandler}
  {...form.register('myFieldName', {
    setValueAs: (value) => sanitizeNumber(value),
    required: 'Please a number',
    validate: {
      maxValue: (value) => Number(value) <= 100 || 'Must be 100 or less',
    },
  })}
/>
```

By default `numberInputHandler()` allows commas, but does not allow decimals or negative numbers. You can pass different options depending on your needs:

```tsx
<Form.Input
  ...
  onInput={(event) => numberInputHandler(event, {
    allowComma: true,
    allowDecimal: true,
    allowNegative: true,
  })}
/>
```

Note that `sanitizeNumber()` in the example above will strip out any commas entered by the user. If a user enters `"1,000"`, the form value will be `"1000"`. This allows users to format with commas as they type, while our data ignores them.
