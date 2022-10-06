# Button

## Standard Button

The `Button` component renders a `<button type="button">` HTML element.

```tsx
import { Button } from '@/components/lib/Button';
import { StableId } from '@/utils/stable-ids';

...

<Button stableId={StableId.NEW_PROJECT_BUTTON} color="danger" onClick={() => alert('Hi!')}>
  New Project
</Button>
```

## Stable ID

A stable identifier (`stableId` prop) provides a unique query selector for this DOM element. This is helpful for tracking DOM events via FullStory as well as assisting in E2E testing. It's important that each `stableId` be unique throughout the app. This is accomplished using the [StableId](../../../utils/stable-ids.ts) enum. Whenever rendering a `Button`, create a new enum entry for your button (please take care to alphabetize your new entry properly).

For example: if you're working on a component named `DeleteProjectModal.tsx` and you're rendering a `Button` that deletes the project once clicked, you could create a `StableId` enum value for `DELETE_PROJECT_MODAL_CONFIRM_BUTTON`.

## Link/Anchor Button

https://nextjs.org/docs/api-reference/next/link

The `ButtonLink` component renders a `<a href="...">` HTML element. The styling and variant props are identical with the standard `<Button>` component. Make sure to wrap the component with Next's `<Link>` component to support client side routing.

```tsx
import Link from 'next/link';
import { ButtonLink } from '@/components/lib/Button';
import { StableId } from '@/utils/stable-ids';

...

<Link href="/projects" passHref>
  <ButtonLink stableId={StableId.PROJECTS_LINK} color="neutral" size="s">
    Projects
  </ButtonLink>
</Link>
```

### External Link

Pass the `external` prop when the link target is outside of DevConsole. This will cause the link to be opened in a new tab and render the `external-link` feather icon in the button

```tsx
import { ButtonLink } from '@/components/lib/Button';

<ButtonLink stableId="try-near-lake" href="https://github.com/near/near-lake-framework" external>
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

<ButtonLabel stableId="file-upload" color="primaryBorder" size="s">
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
