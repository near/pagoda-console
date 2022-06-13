# Checkbox / Radio Card

The `CheckboxCard` component is based on the same HTML structure as `Checkbox`. You can refer to to `Checkbox/README.md` for more information. If you need to create a custom checkbox or radio component, feel free to copy this component as a good starting point.

## Checkbox Group

Make sure to pass a **unique** `name` value for each `Card`. Also, use `aria-label` on the `Group` to apply an assistive description:

```tsx
import * as CheckboxCard from '@/components/lib/CheckboxCard';
import { FeatherIcon } from '@/components/lib/FeatherIcon';

...

<CheckboxCard.Group aria-label="Select your favorite option">
  <CheckboxCard.Card name="myCheckbox1">
    <FeatherIcon icon="sun" />
    <CheckboxCard.Title>Option 1</CheckboxCard.Title>
    <CheckboxCard.Description>Description 1</CheckboxCard.Description>
  </CheckboxCard.Card>

  <CheckboxCard.Card name="myCheckbox2">
    <FeatherIcon icon="moon" />
    <CheckboxCard.Title>Option 2</CheckboxCard.Title>
    <CheckboxCard.Description>Description 2</CheckboxCard.Description>
  </CheckboxCard.Card>
</CheckboxCard.Group>
```

## Radio Group

To render a radio group, simply pass `radio` to each `Card`. Make sure to pass a **shared** `name` value for each. Also, use `aria-label` on the `Group` to apply an assistive description:

```tsx
<CheckboxCard.Group aria-label="Select your favorite option">
  <CheckboxCard.Card radio name="myRadio">
    <FeatherIcon icon="sun" />
    <CheckboxCard.Title>Option 1</CheckboxCard.Title>
    <CheckboxCard.Description>Description 1</CheckboxCard.Description>
  </CheckboxCard.Card>

  <CheckboxCard.Card radio name="myRadio">
    <FeatherIcon icon="moon" />
    <CheckboxCard.Title>Option 2</CheckboxCard.Title>
    <CheckboxCard.Description>Description 2</CheckboxCard.Description>
  </CheckboxCard.Card>
</CheckboxCard.Group>
```

## Stretch

To stretch the cards to fill the container equally, pass `stretch` on the `Group`:

```tsx
<CheckboxCard.Group stretch>...</CheckboxCard.Group>
```

## Customization

You don't have to use `CheckboxCard.Title` or `CheckboxCard.Description` - you can use any combination of components and `css` overrides like so:

```tsx
<CheckboxCard.Group aria-label="Select your favorite option">
  <CheckboxCard.Card type="radio" name="myRadio" css={{ width: '20rem', height: '20rem' }}>
    <Flex>
      <FeatherIcon icon="sun" size="l" />
      <Flex stack>
        <H4>Option 1</H4>
        <Text>Description 1</Text>
      </Flex>
    </Flex>
  </CheckboxCard.Card>
</CheckboxCard.Group>
```

You can manually position the cards with a flex or grid component inside the group:

```tsx
<CheckboxCard.Group aria-label="Select your favorite option">
  <Flex>
    <CheckboxCard.Card>...</CheckboxCard.Card>
    <CheckboxCard.Card>...</CheckboxCard.Card>
  </Flex>
</CheckboxCard.Group>
```

## Putting It All Together

When using a `CheckboxCard.Group`, you'll usually combine it with [React Hook Form](https://react-hook-form.com/) and the `Form` component. Please view the `Putting It All Together` section in `Checkbox/README.md` for a detailed example. The only difference is swapping `CheckboxGroup -> CheckboxCard.Group` and `Checkbox -> CheckboxCard.Card`:

```tsx
<Form.Root onSubmit={handleSubmit((value) => console.log(value))}>
  ...
  <Form.Group gap="m">
    <Form.Label>Favorite Food</Form.Label>

    <CheckboxCard.Group aria-label="Select your favorite food">
      {favoriteFoodOptions.map((option) => (
        <CheckboxCard.Card
          radio
          key={option.value}
          value={option.value}
          isInvalid={!!formState.errors.favoriteFood}
          {...register('favoriteFood', {
            required: 'You must select a favorite food.',
          })}
        >
          <CheckboxCard.Title>{option.display}</CheckboxCard.Title>
        </CheckboxCard.Card>
      ))}
    </CheckboxCard.Group>

    <Form.Feedback>{formState.errors.favoriteFood?.message}</Form.Feedback>
  </Form.Group>
  ...
</Form.Root>
```
