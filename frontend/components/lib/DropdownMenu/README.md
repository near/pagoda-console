# Dropdown Menu

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/dropdown-menu

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Example

Here's an example using all of the dropdown menu features:

```tsx
import * as DropdownMenu from '@/components/lib/DropdownMenu';

...

<DropdownMenu.Root>
  <DropdownMenu.Button>
    Open Menu
  </DropdownMenu.Button>

  <DropdownMenu.Content>
    <DropdownMenu.Item>New Tab</DropdownMenu.Item>
    <DropdownMenu.Item disabled>New Window</DropdownMenu.Item>
    <DropdownMenu.Item>
      <FeatherIcon icon="eye" /> With Icon
    </DropdownMenu.Item>

    <DropdownMenu.Root>
      <DropdownMenu.TriggerItem>More Tools</DropdownMenu.TriggerItem>
      <DropdownMenu.Content nested>
        <DropdownMenu.Item>Save Page As...</DropdownMenu.Item>
        <DropdownMenu.Item>Create Shortcut…</DropdownMenu.Item>
        <DropdownMenu.Item>Name Window…</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>Developer Tools</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>

    <DropdownMenu.Separator />

    <DropdownMenu.CheckboxItem checked={bookmarksChecked} onCheckedChange={setBookmarksChecked}>
      Show Bookmarks
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem checked={urlsChecked} onCheckedChange={setUrlsChecked}>
      Show Full URLs
    </DropdownMenu.CheckboxItem>

    <DropdownMenu.Separator />

    <DropdownMenu.Label>People</DropdownMenu.Label>

    <DropdownMenu.RadioGroup value={person} onValueChange={setPerson}>
      <DropdownMenu.RadioItem value="pedro">Pedro Duarte</DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="colm">Colm Tuite</DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Custom Trigger

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content>...</DropdownMenu.Content>
</DropdownMenu.Root>
```

## Nested Menus

In the above example, note the used of the `nested` prop on the nested menu content component: `<DropdownMenu.Content nested>`. This will set proper offsets for the menu and arrow for nested menus. This prop shouldn't be used on the root menu - only on child menus inside.
