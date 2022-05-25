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
    <Accordion.Trigger>Header 1</Accordion.Trigger>
    <Accordion.Content>
      <P>Content 1</P>
    </Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    <Accordion.Trigger>Header 2</Accordion.Trigger>
    <Accordion.Content>
      <P>Content 2</P>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

## Single

Or you can allow only one section being open at once

```tsx
<Accordion.Root type="single">...</Accordion.Root>
```
