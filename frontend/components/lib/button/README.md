# Button

## Standard Button

The `Button` component renders a `<button type="button">` HTML element.

```tsx
import { Button } from '@/components/lib/button';

...

<Button color="danger" onClick={() => alert('Hi!')}>
  Click Me
</Button>
```

## Link/Anchor Button

https://nextjs.org/docs/api-reference/next/link

The `ButtonLink` component renders a `<a href="...">` HTML element. The styling and variant props are identical with the standard `<Button>` component. Make sure to wrap the component with Next's `<Link>` component to support client side routing.

```tsx
import Link from 'next/link';
import { ButtonLink } from '@/components/lib/button';

...

<Link href="/project-settings" passHref>
  <ButtonLink color="neutral" size="small">
    Link
  </ButtonLink>
</Link>
```
