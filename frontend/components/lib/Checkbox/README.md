# Checkbox / Radio

Accessible checkboxes and radios are made possible using the following HTML (all that's needed is some CSS magic to make them look nice):

```html
<label>
  <input type="checkbox" name="myCheckbox" />
  Toggle Me
</label>
```

```html
<label>
  <input type="radio" name="myRadio" value="1" />
  Option 1
</label>
<label>
  <input type="radio" name="myRadio" value="2" />
  Option 2
</label>
```

The `Checkbox` component is based on the simple HTML structure above. If you need to create a custom checkbox or radio component, feel free to copy this component as a good starting point.

## Single Checkbox

```tsx
import { Checkbox } from '@/components/lib/Checkbox';

...

<Checkbox name="myCheckbox">Toggle Me</Checkbox>
```

You can place other components inside `Checkbox` (icons, links, etc):

```tsx
<Checkbox name="myCheckbox">
  I agree to the{' '}
  <TextLink href="/" target="_blank">
    Terms & Conditions
  </TextLink>
</Checkbox>
```

## Checkbox Group

To render a checkbox group, wrap the `Checkbox` components with the `CheckboxGroup` component. Make sure to pass a **unique** `name` value for each. Also, use `aria-label` to apply an assistive description:

```tsx
import { Checkbox, CheckboxGroup } from '@/components/lib/Checkbox';

...

<CheckboxGroup aria-label="Select your favorite colors">
  <Checkbox name="checkboxOne">
    Orange
  </Checkbox>
  <Checkbox name="checkboxTwo">
    Blue
  </Checkbox>
</CheckboxGroup>
```

## Radio Group

To render a radio group, simply pass `type="radio"` to each `Checkbox`. Make sure to pass a **shared** `name` value for each. Also, use `aria-label` to apply an assistive description:

```tsx
<CheckboxGroup aria-label="Select your favorite food">
  <Checkbox type="radio" name="myRadio">
    Tacos
  </Checkbox>
  <Checkbox type="radio" name="myRadio">
    Pizza
  </Checkbox>
</CheckboxGroup>
```

## Putting It All Together

When using a `Checkbox`, you'll usually combine it with [React Hook Form](https://react-hook-form.com/) and the `Form` component like so:

```tsx
import { useForm } from 'react-hook-form';
import * as Form from '@/components/lib/Form';
import { Checkbox, CheckboxGroup } from '@/components/lib/Checkbox';
import { Flex } from '@/components/lib/Flex';
import { Button } from '@/components/lib/Button';

...

interface MyForm {
  displayName: string;
  favoriteFood: string;
  favoriteColorsBlue: boolean;
  favoriteColorsOrange: boolean;
  termsAccepted: boolean;
}

const { register, handleSubmit, formState } = useForm<MyForm>();

const favoriteFoodOptions = [
  {
    display: 'Pizza',
    value: 'pizza',
  },
  {
    display: 'Taco',
    value: 'taco',
  },
];

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

    <Form.Group gap="m">
      <Form.Label>Favorite Food</Form.Label>

      <CheckboxGroup aria-label="Select your favorite food">
        {favoriteFoodOptions.map((option) => (
          <Checkbox
            radio
            key={option.value}
            value={option.value}
            isInvalid={!!formState.errors.favoriteFood}
            {...register('favoriteFood', {
              required: 'You must select a favorite food.',
            })}
          >
            {option.display}
          </Checkbox>
        ))}
      </CheckboxGroup>

      <Form.Feedback>{formState.errors.favoriteFood?.message}</Form.Feedback>
    </Form.Group>

    <Form.Group gap="m">
      <Form.Label>Favorite Colors</Form.Label>

      <CheckboxGroup aria-label="Select your favorite colors">
        <Checkbox {...register('favoriteColorsOrange')}>Orange</Checkbox>
        <Checkbox {...register('favoriteColorsBlue')}>Blue</Checkbox>
      </CheckboxGroup>

      <Form.Feedback>{formState.errors.favoriteFood?.message}</Form.Feedback>
    </Form.Group>

    <Form.Group>
      <Checkbox
        isInvalid={!!formState.errors.termsAccepted}
        {...register('termsAccepted', {
          required: 'You must accept the terms.',
        })}
      >
        I agree to the terms
      </Checkbox>

      <Form.Feedback>{formState.errors.termsAccepted?.message}</Form.Feedback>
    </Form.Group>

    <Button type="submit">Submit</Button>
  </Flex>
</Form.Root>
```
