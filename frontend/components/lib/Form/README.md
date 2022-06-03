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
      <Form.Group maxWidth="l">
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

    <Form.Group maxWidth="l">
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

  <Form.Group maxWidth="l">
    <Form.Label htmlFor="secondInput">Field Two</Form.Label>
    <Form.Input id="secondInput" />
    <Form.Feedback>...</Form.Feedback>
  </Form.Group>
</Form.Root>
```

## Checkboxes & Radios

View the `Checkbox/README.md` file for information on including checkboxes and radios.
