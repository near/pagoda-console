# Text Link

https://nextjs.org/docs/api-reference/next/link

The `TextLink` component renders a `<a href="...">` HTML element. Make sure to wrap the component with Next's `<Link>` component to support client side routing.

```tsx
import Link from 'next/link';
import { TextLink } from '@/components/lib/TextLink';
import { StableId } from '@/utils/stable-ids';

...

<Link href="/projects" passHref>
  <TextLink stableId={StableId.PROJECTS_LINK} color="neutral">
    View Projects
  </TextLink>
</Link>
```

## Stable ID

Please refer to the [Stable ID Documentation](../Button/README.md) in the `Button` component.

## Button

Sometimes it might make sense to use this component as a `<button>` element. You can use the `TextButton` export instead:

```tsx
import { TextButton } from '@/components/lib/TextLink';
...
<TextButton stableId={StableId.MY_BUTTON} onClick={() => console.log('hi!')}>
  My Button
</TextButton>
```

## External Link

Pass the `external` prop when the link target is outside of DevConsole. This will cause the link to be opened in a new tab and render the `external-link` feather icon in the link:

```tsx
<TextLink stableId={StableId.MY_EXTERNAL_LINK} href="https://github.com/near/near-lake-framework" external>
  External Link
</TextLink>
```
