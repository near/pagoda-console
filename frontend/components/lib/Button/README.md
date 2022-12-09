# Button

## Standard Button

The `Button` component renders a `<button type="button">` HTML element.

```tsx
import { Button } from '@/components/lib/Button';

...

<Button color="danger" onClick={() => alert('Hi!')}>
  New Project
</Button>
```

## Link/Anchor Button

https://nextjs.org/docs/api-reference/next/link

The `ButtonLink` component renders a `<a href="...">` HTML element. The styling and variant props are identical with the standard `<Button>` component. Make sure to wrap the component with Next's `<Link>` component to support client side routing.

```tsx
import Link from 'next/link';
import { ButtonLink } from '@/components/lib/Button';

...

<Link href="/projects" passHref>
  <ButtonLink color="neutral" size="s">
    Projects
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

## Label Button

The `ButtonLabel` component is useful when needing to accomplish a file upload button:

```tsx
import { ButtonLabel } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import * as Form from '@/components/lib/Form';

...

<ButtonLabel color="primaryBorder" size="s">
  <FeatherIcon size="xs" icon="upload" />

  Upload

  <Form.Input
    file
    type="file"
    onChange={handleUpload}
    tabIndex={-1}
    accept="application/JSON"
  />
</ButtonLabel>
```

## Hide Text

When a button has both icon and text, sometimes it makes sense to hide the text and only show the icon on smaller screens. You can accomplish this using the `hideText` prop:

```tsx
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { StableId } from '@/utils/stable-ids';

...

<Button hideText="mobile">
  <FeatherIcon icon="plus" />
  New Project
</Button>

<Button hideText="tablet">
  <FeatherIcon icon="plus" />
  New Environment
</Button>
```
