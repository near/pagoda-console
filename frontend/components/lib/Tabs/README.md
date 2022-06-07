# Tabs

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/tabs

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Example

```tsx
import * as Tabs from '@/components/lib/Tabs';

...

<Tabs.Root defaultValue="tab-1">
  <Tabs.List>
    <Tabs.Trigger value="tab-1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab-2">Tab 2</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="tab-1">
    ...
  </Tabs.Content>

  <Tabs.Content value="tab-2">
    ...
  </Tabs.Content>
</Tabs.Root>
```

## Routing

TODO: Need to figure out how the tabs will work with routing.
