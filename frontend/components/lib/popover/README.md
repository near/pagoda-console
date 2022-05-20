# Popover

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/popover

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Example

Here's an example using the popover:

```tsx
import * as Popover from '@/components/lib/popover';

...

<Popover.Root>
  <Popover.Trigger asChild>
    <Button>Open</Button>
  </Popover.Trigger>

  <Popover.Content>
    <Flex stack>
      <Flex align="center" justify="spaceBetween">
        <H5>Popover Title</H5>
        <Popover.CloseButton />
      </Flex>

      <P>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet
        in, tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus
        non.
      </P>

      <Popover.Close asChild>
        <Button
          size="small"
          color="danger"
          onClick={() => {
            console.log(1);
          }}
        >
          Do Some Action
        </Button>
      </Popover.Close>
    </Flex>
  </Popover.Content>
</Popover.Root>
```

## Conditional Closing

When giving the user an action, sometimes we might need to verify the action is valid before closing the popover. You can accomplish this with `<Popover.Close>` like so:

```tsx
<Popover.Close asChild>
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
</Popover.Close>
```

By calling `e.preventDefault()` on the close button click event, we prevent the popover from closing if the action was not valid.
