# Switch

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/switch

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## No Label

If you don't want to display a label alongside the switch, use an `aria-label` attribute to describe the switch:

```tsx
import { Switch } from '@/components/lib/Switch';

...

<Switch aria-label="Turbo Mode" />
```

## With a Label

If you wrap the switch with a `<label>` HTML tag, you don't need to use `aria-label`:

```tsx
import { Flex } from '@/components/lib/Flex';
import { Switch } from '@/components/lib/Switch';

...

<Flex as="label" align="center">
  <Switch />
  Turbo Mode (Label On Right)
</Flex>

<Flex as="label" align="center">
  Turbo Mode (Label On Left)
  <Switch />
</Flex>
```

## With an Icon

```tsx
import { Switch } from '@/components/lib/Switch';
import { FeatherIcon } from '@/components/lib/FeatherIcon';

...

<Switch aria-label="Zap Mode">
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
