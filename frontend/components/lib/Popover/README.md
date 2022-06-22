# Popover

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/popover

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Example

Here's an example using the popover:

```tsx
import * as Popover from '@/components/lib/Popover';

...

<Popover.Root>
  <Popover.Button>
    Open
  </Popover.Button>

  <Popover.Content>
    <Flex stack>
      <Flex align="center" justify="spaceBetween">
        <H5>Popover Title</H5>
        <Popover.CloseButton />
      </Flex>

      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet
        in, tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus
        non.
      </Text>

      <Popover.Close asChild>
        <Button
          size="s"
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

## Custom Trigger

```tsx
<Popover.Root>
  <Popover.Trigger asChild>
    <Button>Open</Button>
  </Popover.Trigger>

  <Popover.Content>...</Popover.Content>
</Popover.Root>
```

## Anchoring Without Trigger

Sometimes you need to open the popover programatically - without a trigger. In these cases, you can use the `Anchor` component to define where the popover should be displayed instead of using the `Trigger` component.

```tsx
const [isOpen, setIsOpen] = useState(false);

...

<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
  <Popover.Anchor asChild>
    <Text>Popover Near Me</Text>
  </Popover.Anchor>

  <Popover.Content>
    ...
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

## Popover Width

By default, popovers will have a width that automatically fits their content (up to a max, default size). Sometimes it makes sense to match the width of the element that triggers the popover. You can use the `width` property on `Popover.Content` like so:

```tsx
<Popover.Root>
  <Popover.Trigger asChild>
    <Button>Click Here to Open</Button>
  </Popover.Trigger>

  <Popover.Content width="trigger">...</Popover.Content>
</Popover.Root>
```

In the above example, the popover would match the width of the trigger exactly. You can also choose to use the trigger as a max width:

```tsx
<Popover.Content width="maxTrigger">...</Popover.Content>
```
