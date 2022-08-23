# Text Link

https://nextjs.org/docs/api-reference/next/link

The `TextLink` component renders a `<a href="...">` HTML element. Make sure to wrap the component with Next's `<Link>` component to support client side routing.

```tsx
import Link from 'next/link';
import { TextLink } from '@/components/lib/TextLink';
...
<Link href="/foobar" passHref>
  <TextLink color="neutral">
    Link
  </TextLink>
</Link>
```

## Button

Sometimes it might make sense to use this component as a `<button>` element. You can use the `TextButton` export instead:

```tsx
import { TextButton } from '@/components/lib/TextLink';
...
<TextButton onClick={() => console.log('hi!')}>
  My Button
</TextButton>
```

## External Link

Pass the `external` prop when the link target is outside of DevConsole. This will cause the link to be opened in a new tab and render the `external-link` feather icon in the link:

```tsx
<TextLink href="https://github.com/near/near-lake-framework" external>
  External Link
</TextLink>
```
