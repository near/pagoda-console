# Card

## Example

A `Card` component can contain any combination of components. Here's an example of a standard card:

```tsx
import { Card } from '@/components/lib/Card';
...
<Card>
  <Flex stack>
    <FeatherIcon icon="box" size="m" />
    <H4>Standard Card</H4>
    <Text>Cards can contain anything.</Text>
  </Flex>
</Card>
```

## Border

A `Card` component can be rendered with a border instead of a background:

```tsx
<Card border>...</Card>
```

## Clickable

Sometimes, an entire `Card` should act as a clickable button. You can use the `clickable` and `as` properties to accomplish this:

```tsx
<Card clickable as="button" type="button" onClick={() => alert('Click!')}>
  <Flex stack>
    <FeatherIcon icon="box" size="m" color="primary" />
    <H4>Clickable Card</H4>
    <Text>Cards can be clickable.</Text>
  </Flex>
</Card>
```

## Padding & Border Radius

The padding and border radius can be configured (both default to `l`):

```tsx
<Card borderRadius="s" padding="s">
  ...
</Card>
```
