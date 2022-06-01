# Toast

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/toast

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Example

Using the `openToast` API allows you to easily open a toast from any context:

```tsx
import { openToast } from '@/components/lib/Toast';

...

<Button
  onClick={() =>
    openToast({
      type: 'error',
      title: 'Toast Title',
      description: 'This is a great toast description.',
    })
  }
>
  Open a Toast
</Button>
```

You can pass other options too:

```tsx
<Button
  onClick={() =>
    openToast({
      type: 'success',
      title: 'Toast Title',
      description: 'This is a great toast description.',
      icon: 'zap',
      action: () => {
        alert(1);
      },
      actionText: 'Do Action',
    })
  }
>
  With an Action + Icon
</Button>
```

## Custom Toast

If you need something more custom, you can render a custom toast using `lib/Toast/Toaster.tsx` as an example like so:

```tsx
import * as Toast from '@/components/lib/Toast';

...

<Toast.Provider duration={5000}>
  <Toast.Root open={isOpen} onOpenChange={setIsOpen}>
    <Toast.Title>My Title</Toast.Title>
    <Toast.Description>My Description</Toast.Description>

    <Toast.Action altText="Do Action" asChild>
      <Button onClick={doAction}>
        Do Action
      </Button>
    </Toast.Action>

    <Toast.CloseButton />
  </Toast.Root>

  <Toast.Viewport />
</Toast.Provider>
```
