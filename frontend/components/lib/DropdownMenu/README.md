# Dropdown Menu

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/dropdown-menu

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Example

Here's an example using all of the dropdown menu features:

```tsx
import { Text } from '@/components/lib/Text';
import * as DropdownMenu from '@/components/lib/DropdownMenu';

...

const [bookmarksChecked, setBookmarksChecked] = useState(true);
const [urlsChecked, setUrlsChecked] = useState(false);
const [person, setPerson] = useState('pedro');

...

<DropdownMenu.Root>
  <DropdownMenu.Button>
    Open Menu
  </DropdownMenu.Button>

  <DropdownMenu.Content>
    <DropdownMenu.ContentItem>
      <Text>This can contain any read only content.</Text>
    </DropdownMenu.ContentItem>

    <DropdownMenu.Item>New Tab</DropdownMenu.Item>
    <DropdownMenu.Item disabled>New Window</DropdownMenu.Item>
    <DropdownMenu.Item>
      <FeatherIcon icon="eye" /> With Icon
    </DropdownMenu.Item>

    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>More Tools</DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.Item>Save Page As...</DropdownMenu.Item>
        <DropdownMenu.Item>Create Shortcut…</DropdownMenu.Item>
        <DropdownMenu.Item>Name Window…</DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>

    <DropdownMenu.Separator />

    <DropdownMenu.CheckboxItem checked={bookmarksChecked} onCheckedChange={setBookmarksChecked}>
      Show Bookmarks
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem checked={urlsChecked} onCheckedChange={setUrlsChecked}>
      Show Full URLs
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem disabled>
      Disabled Exampled
    </DropdownMenu.CheckboxItem>

    <DropdownMenu.Separator />

    <DropdownMenu.Label>People</DropdownMenu.Label>

    <DropdownMenu.RadioGroup value={person} onValueChange={setPerson}>
      <DropdownMenu.RadioItem value="pedro">Pedro Duarte</DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="colm">Colm Tuite</DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="foo" disabled>Disabled Example</DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Custom Radio/Checkbox Indicator

By default, `RadioItem` will use a circular checkmark and `CheckboxItem` will use a square checkmark for indicating whether the item is selected. You can pass a custom indicator for either like so:

```tsx
<DropdownMenu.CheckboxItem
  indicator={<FeatherIcon icon="sun" />}
  checked={bookmarksChecked}
  onCheckedChange={setBookmarksChecked}
>
  Show Bookmarks
</DropdownMenu.CheckboxItem>
```

When the item is unchecked, a neutral color will be applied to your indicator. When the item is checked, our primary color will be applied. If needed, you can also apply custom styles based on `data-state="checked"` or `data-state="unchecked"`:

```tsx
<DropdownMenu.CheckboxItem
  css={{
    '&[data-state="checked"]': {
      background: 'var(--color-primary)',
    },
  }}
  indicator={<FeatherIcon icon="sun" />}
  checked={bookmarksChecked}
  onCheckedChange={setBookmarksChecked}
>
  Show Bookmarks
</DropdownMenu.CheckboxItem>
```

If you don't want any indicator to be shown, you can pass `null`:

```tsx
<DropdownMenu.CheckboxItem indicator={null} checked={bookmarksChecked} onCheckedChange={setBookmarksChecked}>
  Show Bookmarks
</DropdownMenu.CheckboxItem>
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

## Text Overflow

When a user selects a value that can have a really long text value, it's usually necessary to truncate the text at a certain point. You can implement this using the `TextOverflow` component like so:

```tsx
import { TextOverflow } from '@/components/lib/TextOverflow';

...

<DropdownMenu.Root>
  <DropdownMenu.Button css={{ width: '15rem' }}>
    <TextOverflow>Some Really Long Content Would Go Here</TextOverflow>
  </DropdownMenu.Button>

  <DropdownMenu.Content>...</DropdownMenu.Content>
</DropdownMenu.Root>
```

## Sticky Footer

You can use the `ContentStickyFooter` component inside `Content` to create a sticky footer when scrolling through dropdown options:

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content>
    <DropdownMenu.Item>Item 1</DropdownMenu.Item>
    <DropdownMenu.Item>Item 2</DropdownMenu.Item>
    <DropdownMenu.Item>Item 3</DropdownMenu.Item>

    <DropdownMenu.ContentStickyFooter>
      <DropdownMenu.Item color="primary">New Item</DropdownMenu.Item>
    </DropdownMenu.ContentStickyFooter>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Nested Menus

In the primary `Example` section above, note the use of the `Sub`, `SubTrigger`, and `SubContent` components to achieve a nested menu.

## Form Select Dropdown

A common use case for this component will be using it as a dropdown select in a form. Instead of using `DropdownMenu.Button`, we'll use `Form.FloatingLabelSelect`.

### With React Hook Form

Typically, you'll integrate the select dropdown with [React Hook Form](https://react-hook-form.com/) for state management and validation. Due to the complexities of the dropdown components, we'll need to use the `Controller` component provided by `React Hook Form` (instead of using the simpler `register()` method).

```tsx
import { Controller, useForm } from 'react-hook-form';
import * as Form from '@/components/lib/Form';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';

...

interface MyForm {
  favoriteWeather: string;
  somethingElse: string;
}

const myForm = useForm<MyForm>();

const favoriteWeatherOptions = [
  {
    id: '1',
    display: 'Thunderstorm',
    icon: 'cloud-lightning',
  },
  {
    id: '2',
    display: 'Sunny',
    icon: 'sun',
  },
  {
    id: '3',
    display: 'Snow',
    icon: 'cloud-snow',
    disabled: true,
  },
];

<Form.Root onSubmit={myForm.handleSubmit((value) => console.log(value) )}>
  ...

  <Controller
    name="favoriteWeather"
    control={myForm.control}
    rules={{
      required: 'Please select your favorite weather',
    }}
    render={({ field }) => {
      const favoriteWeather = favoriteWeatherOptions.find((option) => option.id === field.value);

      return (
        <Form.Group>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Form.FloatingLabelSelect
                label="Favorite Weather"
                isInvalid={!!myForm.formState.errors.favoriteWeather}
                onBlur={field.onBlur}
                ref={field.ref}
                selection={favoriteWeather?.display}
              />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content align="start">
              <DropdownMenu.RadioGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                {favoriteWeatherOptions.map((option) => (
                  <DropdownMenu.RadioItem
                    disabled={option.disabled}
                    indicator={<FeatherIcon icon={option.icon} />}
                    value={option.id}
                    key={option.id}
                  >
                    {option.display}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <Form.Feedback>{myForm.formState.errors.favoriteWeather?.message}</Form.Feedback>
        </Form.Group>
      );
    }}
  />

  ...
</Form.Root>
```

Note the `selection` prop above in `Form.FloatingLabelSelect`. When a value is not selected, the `selection` prop should return a falsy value. When a value is selected, the `selection` prop should return a `ReactNode` (or `string`) that displays the current selection. This allows the floating `label` value to function properly (shrinking when a value is selected).

Also, note the use of `DropdownMenu.RadioGroup` and `DropdownMenu.RadioItem` instead of simply using `DropdownMenu.Item`. This will provide better semantics and accessibility for our use case.

### Selection Icon

If you need to support displaying an icon (or any other components) alongside the current selection, the `selection` prop could be expanded on like so:

```tsx
<Form.FloatingLabelSelect
  ...
  selection={
    favoriteWeather && (
      <>
        <FeatherIcon icon={favoriteWeather.icon} color="primary" />
        {favoriteWeather.display}
      </>
    )
  }
/>
```

### Multi Select

It should be technically feasible to support the user selecting multiple options by using `DropdownMenu.CheckboxItem`, but this will need further investigation.

## Menu Width

By default, dropdown menus will have a width that automatically fits their content (up to a max, default size). Sometimes it makes sense to match the width of the element that triggers the dropdown. You can use the `width` property on `DropdownMenu.Content` like so:

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <Button>Click Here to Open</Button>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content width="trigger">...</DropdownMenu.Content>
</DropdownMenu.Root>
```

In the above example, the dropdown menu would match the width of the trigger exactly. You can also choose to use the trigger as a max width:

```tsx
<DropdownMenu.Content width="maxTrigger">...</DropdownMenu.Content>
```
