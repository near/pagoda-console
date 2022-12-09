# Accordion

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/accordion

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Multiple

You can allow multiple sections being open at once.

```tsx
import * as Accordion from '@/components/lib/Accordion';

...

<Accordion.Root type="multiple" defaultValue={['item-1']}>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Crazy Section</Accordion.Trigger>
    <Accordion.Content>
      <Text>Crazy section content.</Text>
    </Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    <Accordion.Trigger>Insane Section</Accordion.Trigger>
    <Accordion.Content>
      <Text>Insane section content.</Text>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

## Single

Or you can allow only one section being open at once

```tsx
<Accordion.Root type="single">...</Accordion.Root>
```

## Disable a Trigger

You can disable any accordion trigger using the disabled prop:

```tsx
<Accordion.Root type="multiple" defaultValue={['item-1']}>
  <Accordion.Item value="item-1">
    <Accordion.Trigger disabled>I am disabled</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    <Accordion.Trigger>I am clickable</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

## No Arrow Indicators

If you don't want open/close arrow indicators to be shown, use the `noArrow` prop:

```tsx
<Accordion.Root type="multiple" noArrow>
  ...
</Accordion.Root>
```

## Inline

For a "less boxy" accordion look, use the `inline` prop:

```tsx
<Accordion.Root type="multiple" inline>
  ...
</Accordion.Root>
```
