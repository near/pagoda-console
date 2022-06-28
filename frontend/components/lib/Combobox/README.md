# Combobox

A combobox should be used when allowing a user to type a custom value, while also providing autocomplete suggestions. If you need to enforce a specific selection, you should lean towards using `DropdownMenu`.

Currently, Radix doesn't have a combobox component - it's on their roadmap: https://github.com/radix-ui/primitives/issues/1342

In the mean time, [Downshift](https://www.downshift-js.com) is a great library for implementing an accessible combobox. More specifically, we'll be using their `useCombobox()` hook: https://www.downshift-js.com/use-combobox

## Example

Note a few important details below:

1. Pass a unique `id` when calling `useCombobox()`. If an `id` value isn't passed, Downshift auto generates an `id`, which causes a Next JS hydration error.
2. You are in control of how the menu results should be filtered via `onInputValueChange()`.
3. `Combobox.MenuLabel` and `Combobox.MenuContent` are optional components. There might be times where they aren't necessary for UX.

```tsx
import { useCombobox } from 'downshift';
import * as Combobox from '@/components/lib/Combobox';
import * as Form from '@/components/lib/Form';

...

const books = [
  { author: 'Harper Lee', title: 'To Kill a Mockingbird' },
  { author: 'Lev Tolstoy', title: 'War and Peace' },
  { author: 'Fyodor Dostoyevsy', title: 'The Idiot' },
];

const [myComboboxItems, setMyComboboxItems] = useState([...books]);

const myCombobox = useCombobox({
  id: 'myCombobox1',
  items: myComboboxItems,
  itemToString(item) {
    return item ? item.title : '';
  },
  onInputValueChange({ inputValue }) {
    const query = inputValue?.toLowerCase().trim();
    const filtered = books.filter(
      (item) => !query || item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query),
    );
    setMyComboboxItems(filtered);
  },
});

...

<Combobox.Root open={myCombobox.isOpen}>
  <Combobox.Box toggleButtonProps={{ ...myCombobox.getToggleButtonProps() }} {...myCombobox.getComboboxProps()}>
    <Form.FloatingLabelInput
      label="Favorite Book"
      labelProps={{ ...myCombobox.getLabelProps() }}
      {...myCombobox.getInputProps()}
    />
  </Combobox.Box>

  <Combobox.Menu {...myCombobox.getMenuProps()}>
    <Combobox.MenuLabel>
      <FeatherIcon icon="book" size="xs" />
      Suggestions:
    </Combobox.MenuLabel>

    {myComboboxItems.length === 0 && (
      <Combobox.MenuContent>
        No matching suggestions found.{' '}
        <Text color="primary" size="bodySmall" as="span">
          &quot;{myCombobox.inputValue}&quot;
        </Text>{' '}
        will be added as a new book.
      </Combobox.MenuContent>
    )}

    {myComboboxItems.map((item, index) => (
      <Combobox.MenuItem {...myCombobox.getItemProps({ item, index })} key={item.title}>
        <Flex stack gap="none">
          <Text color="text1">{item.author}</Text>
          <Text color="text2" size="bodySmall">
            {item.title}
          </Text>
        </Flex>
      </Combobox.MenuItem>
    ))}
  </Combobox.Menu>
</Combobox.Root>
```

## No Toggle Button

Sometimes it makes sense to not show an open/close toggle button. You can do that by omitting the `toggleButtonProps` on `Combobox.Box`:

```tsx
<Combobox.Box {...myCombobox.getComboboxProps()}>...</Combobox.Box>
```

## Outside Label

If you don't want to use a floating label, you can render an outside label:

```tsx
<Form.Group maxWidth="m">
  <Form.Label {...myCombobox.getLabelProps()}>Favorite Books</Form.Label>

  <Combobox.Root open={myCombobox.isOpen}>
    <Combobox.Box {...myCombobox.getComboboxProps()}>
      <Form.Input {...myCombobox.getInputProps()} />
    </Combobox.Box>

    <Combobox.Menu {...myCombobox.getMenuProps()}>...</Combobox.Menu>
  </Combobox.Root>
</Form.Group>
```

## Hide Menu (No Results)

Sometimes it makes sense to hide the dropdown menu entirely when no suggestions match. You can accomplish this by extending the logic for the `open` property on `Combobox.Root` to also check for items length:

```tsx
<Combobox.Root open={myCombobox.isOpen && myComboboxItems.length > 0}></Combobox.Root>
```

## Auto Open On Focus

Sometimes it makes sense to automatically open the dropdown menu whenever the input is focused. You can accomplish this by extending the `onFocus` event for the input:

```tsx
<Combobox.Box {...myCombobox.getComboboxProps()}>
  <Form.FloatingLabelInput
    label="Favorite Book"
    labelProps={{ ...myCombobox.getLabelProps() }}
    {...myCombobox.getInputProps({
      onFocus: () => !myCombobox.isOpen && myCombobox.openMenu(),
    })}
  />
</Combobox.Box>
```

## With React Hook Form

Typically, you'll integrate the combobox with [React Hook Form](https://react-hook-form.com/) for state management and validation. Take note of the following:

1. Due to both Downshift and RHF needing to pass overlapping events (`onBlur`, `onChange`) and overlapping props (`ref`), we'll need to use `mergeInputProps()`.
2. It's important to call `form.clearErrors('favoriteBook')` inside `onSelectedItemChange()`. When a Downshift menu item is selected, a native input `change` event is not triggered (meaning RHF will not know to revalidate and clear the error automatically).

```tsx
import { useForm } from 'react-hook-form';
import * as Form from '@/components/lib/Form';
import * as Combobox from '@/components/lib/Combobox';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Text } from '@/components/lib/Text';
import { Flex } from '@/components/lib/Flex';
import { mergeInputProps } from '@/utils/merge-input-props';

...

interface MyForm {
  favoriteBook: string;
  somethingElse: string;
}

const books = [
  { author: 'Harper Lee', title: 'To Kill a Mockingbird' },
  { author: 'Lev Tolstoy', title: 'War and Peace' },
  { author: 'Fyodor Dostoyevsy', title: 'The Idiot' },
];

...

const myForm = useForm<MyForm>();
const [myComboboxItems, setMyComboboxItems] = useState([...books]);

const myCombobox = useCombobox({
  id: 'myCombobox1',
  items: myComboboxItems,
  itemToString(item) {
    return item ? item.title : '';
  },
  onInputValueChange({ inputValue }) {
    const query = inputValue?.toLowerCase().trim();
    const filtered = books.filter(
      (item) => !query || item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query),
    );
    setMyComboboxItems(filtered);
  },
  onSelectedItemChange() {
    form.clearErrors('favoriteBook');
  },
});

<Form.Root onSubmit={myForm.handleSubmit((value) => console.log(value) )}>
  ...

  <Form.Group>
    <Combobox.Root open={myCombobox.isOpen}>
      <Combobox.Box
        toggleButtonProps={{ ...myCombobox.getToggleButtonProps() }}
        {...myCombobox.getComboboxProps()}
      >
        <Form.FloatingLabelInput
          label="Favorite Book"
          labelProps={{ ...myCombobox.getLabelProps() }}
          isInvalid={!!myForm.formState.errors.favoriteBook}
          {...mergeInputProps(
            myCombobox.getInputProps(),
            myForm.register('favoriteBook', {
              required: 'Please enter a favorite book',
            }),
          )}
        />
      </Combobox.Box>

      <Combobox.Menu {...myCombobox.getMenuProps()}>
        <Combobox.MenuLabel>
          <FeatherIcon icon="book" size="xs" /> Suggestions:
        </Combobox.MenuLabel>

        {myComboboxItems.length === 0 && (
          <Combobox.MenuContent>
            No matching suggestions found.{' '}
            <Text color="primary" size="bodySmall" as="span">
              &quot;{myCombobox.inputValue}&quot;
            </Text>{' '}
            will be added as a new book.
          </Combobox.MenuContent>
        )}

        {myComboboxItems.map((item, index) => (
          <Combobox.MenuItem {...myCombobox.getItemProps({ item, index })} key={item.title}>
            <Flex stack gap="none">
              <Text color="text1">{item.author}</Text>
              <Text color="text2" size="bodySmall">
                {item.title}
              </Text>
            </Flex>
          </Combobox.MenuItem>
        ))}
      </Combobox.Menu>
    </Combobox.Root>

    <Form.Feedback>{myForm.formState.errors.favoriteBook?.message}</Form.Feedback>
  </Form.Group>

  ...
</Form.Root>
```
