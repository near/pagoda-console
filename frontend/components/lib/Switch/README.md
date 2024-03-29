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

## Debounce

Sometimes it makes sense to debounce a switch toggle change event. We can allow a user to visually toggle the switch rapidly, but only respond to the change event once by using the `debounce` prop. Passing `true` as the value will use our default delay:

```tsx
const [something, setSomething] = useState({
  name: 'Something Cool',
  isActive: false
});

const updateFeatureIsActive = useCallback(
  async (isChecked: boolean) => {
    // if (something) ...
    // Make an HTTP request...
    // Update state via setSomething()
  },
  [something],
);


...

<Switch
  aria-label="Cool Feature"
  checked={something.isActive}
  onCheckedChange={updateFeatureIsActive}
  debounce={true}
/>
```

You can also pass a number for a custom delay value (milliseconds):

```tsx
<Switch ... debounce={300} />
```

Note the use of `useCallback()` above. When using `debounce`, it's **critical** that the `onCheckedChange` prop is passed a `useCallback()` reference. Otherwise, the `useDebounce()` hook that is used inside the `Switch` component will continually reevaluate and not function correctly.

For more information, read this article: https://dmitripavlutin.com/react-hooks-stale-closures/

### Custom Debounce

It's possible you'll come across a more advanced use case for debouncing a `Switch` toggle event that isn't supported. In that case, feel free to omit the `debounce` prop and create your own debounced `onCheckedChange` event via `hooks/debounce.ts`:

```tsx
import { useDebounce } from '@/hooks/debounce';

...

const myDebouncedHandler = useDebounce(...);

<Switch
  aria-label="Cool Feature"
  onCheckedChange={myDebouncedHandler}
/>;
```

For more information on debouncing, read this article: https://dmitripavlutin.com/react-throttle-debounce/
