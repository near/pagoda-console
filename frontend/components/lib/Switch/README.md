# Switch

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/switch

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## No Label

```tsx
import { Switch } from '@/components/lib/Switch';

...

<Switch aria-label="Turbo Mode" />
```

## With a Label

```tsx
import { Flex } from '@/components/lib/Flex';
import { Switch } from '@/components/lib/Switch';

...

<Flex as="label" align="center">
  <Switch />
  With a Label On Right
</Flex>

<Flex as="label" align="center">
  With a Label On Left
  <Switch />
</Flex>
```

## With an Icon

```tsx
import { Switch } from '@/components/lib/Switch';
import { FeatherIcon } from '@/components/lib/FeatherIcon';

...

<Switch>
  <FeatherIcon icon="zap" size="xs" />
</Switch>
```

## With a Dynamic Icon

```tsx
import { Switch } from '@/components/lib/Switch';
import { FeatherIcon } from '@/components/lib/FeatherIcon';

...

<Switch aria-label="Dark Mode">
  <FeatherIcon icon="moon" size="xs" data-on />
  <FeatherIcon icon="sun" size="xs" data-off />
</Switch>
```
