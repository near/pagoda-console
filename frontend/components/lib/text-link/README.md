# Text Link

https://nextjs.org/docs/api-reference/next/link

The `TextLink` component renders a `<a href="...">` HTML element. Make sure to wrap the component with Next's `<Link>` component to support client side routing.

```tsx
import Link from 'next/link';
import { TextLink } from '@/components/lib/text-link';

...

<Link href="/project-settings" passHref>
  <TextLink color="neutral">
    Link
  </TextLink>
</Link>
```
