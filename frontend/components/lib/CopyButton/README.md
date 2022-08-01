# Copy Button

This component wraps the standard `Button` component and provides a convenient way to allow users to copy values to their clipboards.

## Example

If you pass only a `value` prop (this defines the string copied to the clipboard), the button will render with just a clipboard icon:

```tsx
import { CopyButton } from '@/components/lib/CopyButton';
...
<CopyButton value="123" />
```

## With Content

If you'd like to render content next to the icon, you can use the `content` prop:

```tsx
<CopyButton content="Copy my crazy value" value="123" />
```

## Content Same as Value

If you want to display the exact value being copied to the clipboard, just pass the `content` prop:

```tsx
<CopyButton content="123" />
```

## Button Styles

You can pass style variant overrides - just like a standard `Button`:

```tsx
<CopyButton content="123" color="primary" size="m" />
```
