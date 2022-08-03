# Truncate Middle

This component uses our `utils/truncate-middle.tsx` helper method under the hood. This component allows you to truncate the middle of a string based on screen breakpoints - while also maintaining accessibility.

If you don't need to dynamically change truncation based on screen size, you should use the helper method directly like so:

```tsx
import { truncateMiddle } from '@/utils/truncate-middle';
...
<Text>{truncateMiddle(myString, 5, 10)}</Text>
```

## Examples

You can define how many characters should be rendered in the `prefix` vs `suffix` for every breakpoint like so:

```tsx
import { Text } from '@/components/lib/Text';
import { TruncateMiddle } from '@/components/lib/TruncateMiddle';

...

<Text weight="semibold" color="text1">
  <TruncateMiddle
    value={myString}
    prefix={30}
    prefixLaptop={20}
    prefixTablet={10}
    prefixMobile={5}
    suffix={10}
    suffixLaptop={8}
    suffixTablet={4}
    suffixMobile={2}
  />
</Text>
```

The following example uses the same suffix size for all breakpoints:

```tsx
import { TruncateMiddle } from '@/components/lib/TruncateMiddle';

...

<TruncateMiddle
  value={myString}
  prefix={30}
  prefixLaptop={20}
  prefixTablet={10}
  prefixMobile={5}
  suffix={5}
/>
```

You can omit any of the suffix/prefix properties (only `prefix` and `suffix` are required). The previous breakpoint value will be inherited. The following example sets a laptop postfix and suffix value, which will be used for laptops and all smaller devices:

```tsx
import { TruncateMiddle } from '@/components/lib/TruncateMiddle';

...

<TruncateMiddle
  value={myString}
  prefix={30}
  prefixLaptop={5}
  suffix={30}
  suffixLaptop={5}
/>
```

If the length of the string passed in as `value` is less than or equal to `postfix + suffix`, the value will be rendered normally without an ellipsis.

## Tooltip

Sometimes it will make sense to combine this component with the `Tooltip` component:

```tsx
import { Text } from '@/components/lib/Text';
import { TruncateMiddle } from '@/components/lib/TruncateMiddle';
import { Tooltip } from '@/components/lib/Tooltip';

...

<Text weight="semibold" color="text1">
  <Tooltip content={myString}>
    <TruncateMiddle value={myString} ... />
  </Tooltip>
</Text>
```
