# Slider

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/slider

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Example

```tsx
import * as Slider from '@/components/lib/Slider';

...

<Slider.Root defaultValue={[25]}>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb />
  <Slider.Thumb />
</Slider.Root>
```

## Range (Multi Thumb) & More

For more details, please refer to the Radix docs: https://www.radix-ui.com/docs/primitives/components/slider
