# SVG Icon

Sometimes we need to pull in custom SVG icons. This component can be used to wrap an imported SVG and apply standard colors and sizes.

## Example

```tsx
import ExampleIcon from '@/public/images/icons/ui-example.svg';
import { SvgIcon } from '@/components/lib/SvgIcon';

...

<SvgIcon size="xl" color="danger" icon={ExampleIcon} />
```

## Stroke Only

By default, a fill value of `currentColor` is set via CSS. Some icons are designed only using strokes (without any fills), which break when having a fill applied. You can use the `noFill` prop to only inherit a stroke color, and not a fill:

```tsx
<SvgIcon icon={ExampleIcon} noFill />
```

## Important Notes

Take note of the example SVG's source code: `public/images/icons/ui-example.svg`

- It uses a square ratio `viewBox` property. This property is critical for the SVG icon to scale correctly at different sizes.
- There are no `fill` or `stroke` properties manually setting a color. This is critical for inheriting the defined color. Alternatively, you can set `fill` or `stroke` values to `currentColor` like so: `fill="currentColor"`.
