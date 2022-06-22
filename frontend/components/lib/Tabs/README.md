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

Sometimes it will make sense to sync the selected tab with the URL - each trigger acting as a link instead of a button. Here's an example of driving the selected tab via a URL query param:

```tsx
import { useRouteParam } from '@/hooks/route';

...

const activeTab = useRouteParam('tab', '?tab=section-1', true);

...

<Tabs.Root value={activeTab || ''}>
  <Tabs.List>
    <Link href="?tab=section-1" passHref>
      <Tabs.TriggerLink active={activeTab === 'section-1'}>Section 1</Tabs.TriggerLink>
    </Link>

    <Link href="?tab=section-2" passHref>
      <Tabs.TriggerLink active={activeTab === 'section-2'}>Section 2</Tabs.TriggerLink>
    </Link>
  </Tabs.List>

  <Tabs.Content value="section-1">...</Tabs.Content>
  <Tabs.Content value="section-2">...</Tabs.Content>
</Tabs.Root>;
```

Note the use of `Tabs.TriggerLink` wrapped by `Link` (an anchor element) instead of `Tabs.Trigger` (a button element). This will allow users to interact with the tabs as standard links (supports opening new tabs, browser history, etc).
