# Dialog

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/dialog

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Controlled

A controlled modal via a boolean state property will give you the most control over when the modal should open or close. This will make sense for most use cases.

```tsx
import * as Dialog from '@/components/lib/Dialog';

...

const [dialogIsOpen, setDialogIsOpen] = useState(false);

...

<Button
  onClick={() => {
    setDialogIsOpen(true);
  }}
>
  Controlled
</Button>

...

<Dialog.Root open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
  <Dialog.Content title="Your Modal Title">
    <P>Your modal content.</P>
  </Dialog.Content>
</Dialog.Root>
```

## Trigger

A trigger dialog doesn't give you a programmatic way of opening or closing the dialog, which is problematic for most use cases. However, if you have a very simple dialog you might be able to get away with it. Note how the `<Dialog.Root>` element needs to wrap `<Dialog.Trigger>`.

```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Trigger</Button>
  </Dialog.Trigger>

  <Dialog.Content title="Your Modal Title">
    <P>You modal content.</P>

    <Dialog.Close asChild>
      <Button>Close Modal</Button>
    </Dialog.Close>
  </Dialog.Content>
</Dialog.Root>
```

## Title

The `title` prop on `<Dialog.Content>` can be passed a string to render a default title and close button:

```tsx
<Dialog.Content title="Your Modal Title">...</Dialog.Content>
```

A `ReactNode` can also be passed if you want to use a custom set of elements to render the title (the default close button will be rendered next to your elements). Note that it's important to use `<Dialog.Title>` when creating a custom header to maintain accessibility. You can extend the styles of `<Dialog.Title>` via Stitches to create a custom looking title.

```tsx
<Dialog.Content
  title={
    <>
      <Dialog.Title>Your Modal Title</Dialog.Title>
      <P>Your Modal Subtitle</P>
    </>
  }
></Dialog.Content>
```

If you omit the `title` prop entirely, no default title or close button will be rendered. This will give you the ability to implement your own title and close button via `<Dialog.Title>` and `<Dialog.Close>`.

```tsx
<Dialog.Content>
  <Dialog.Title>Your Modal Title</Dialog.Title>

  <P>You modal content.</P>

  <Dialog.Close asChild>
    <Button>Close Modal</Button>
  </Dialog.Close>
</Dialog.Content>
```

## Conditional Closing

When giving the user an action, sometimes we might need to verify the action is valid before closing the dialog. You can accomplish this with `<Dialog.Close>` like so:

```tsx
<Dialog.Close asChild>
  <Button
    onClick={(e) => {
      ...

      if (!isValid) {
        e.preventDefault();
        return;
      }

      console.log('is valid!');
    }}
  >
    Do Some Action
  </Button>
</Dialog.Close>
```

By calling `e.preventDefault()` on the close button click event, we prevent the dialog from closing if the action was not valid.
