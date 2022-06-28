# Button

## Standard Button

The `Button` component renders a `<button type="button">` HTML element.

```tsx
import { Button } from '@/components/lib/Button';

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
import { ButtonLink } from '@/components/lib/Button';

...

<Link href="/project-settings" passHref>
  <ButtonLink color="neutral" size="s">
    Link
  </ButtonLink>
</Link>
```

### External Link

Pass the `external` prop when the link target is outside of DevConsole. This will cause the link to be opened in a new tab and render the `external-link` feather icon in the button

```tsx
import { ButtonLink } from '@/components/lib/Button';

<ButtonLink href="https://github.com/near/near-lake-framework" external>
  Try Out NEAR Lake
</ButtonLink>;
```
