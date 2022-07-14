# Table

Tables are great for listing lots of data for users to easily scan. This component doesn't implement sorting or filtering - that will be up to you to implement based on your individual needs. Sometimes it might make sense to filter/sort via an API or filter/sort on the client.

## Example

```tsx
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import * as Table from '@/components/lib/Table';

const tableRows = [
  {
    id: 1000,
    icon: 'zap',
    name: 'Franky Frank',
    favoriteColor: 'Orange',
    token: 'afsa2423asdfj32afd323',
    address: '1234 Cool Ave, Denver, CO',
  },
  {
    id: 2000,
    icon: 'sun',
    name: 'Bobby Bob',
    favoriteColor: 'Blue',
    token: 'hrgerg34243hr23j4fkhj',
    address: '3456 Super Amazing St, Richmond, VA',
  },
  {
    id: 3000,
    icon: 'moon',
    name: 'Stevey Steve',
    favoriteColor: 'Green',
    token: 'j3kj43543543jl543454jk',
    address: '65465 Some Really Long Address, Some Really Cool City, CO',
  },
];

...

<Table.Root>
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>ID</Table.HeaderCell>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Favorite Color</Table.HeaderCell>
      <Table.HeaderCell>Token</Table.HeaderCell>
      <Table.HeaderCell>Address</Table.HeaderCell>
      <Table.HeaderCell></Table.HeaderCell>
    </Table.Row>
  </Table.Head>

  <Table.Body>
    {tableRows.map((row) => {
      return (
        <Table.Row key={row.id}>
          <Table.Cell>
            <Text family="number" color="text3" size="current">
              {row.id}
            </Text>
          </Table.Cell>
          <Table.Cell>
            <Flex align="center" gap="s">
              <FeatherIcon icon={row.icon} color="text3" />
              {row.name}
            </Flex>
          </Table.Cell>
          <Table.Cell>
            <Badge size="s">
              <FeatherIcon icon={row.icon} size="xs" />
              {row.favoriteColor}
            </Badge>
          </Table.Cell>
          <Table.Cell>
            <Text family="number" color="text1" size="current" css={{ maxWidth: '6rem' }}>
              <TextOverflow>{row.token}</TextOverflow>
            </Text>
          </Table.Cell>
          <Table.Cell wrap css={{ minWidth: '15rem' }}>
            {row.address}
          </Table.Cell>
          <Table.Cell css={{ width: '1px' }}>
            <Flex>
              <Button size="s">
                <FeatherIcon icon="edit-2" size="xs" />
              </Button>
              <Button size="s" color="neutral">
                <FeatherIcon icon="trash-2" size="xs" />
              </Button>
            </Flex>
          </Table.Cell>
        </Table.Row>
      );
    })}
  </Table.Body>
</Table.Root>
```

## Cell Sizes

In the example above, note the use of the `css` prop on some of the `Cell` components. You can get creative with setting `width`, `maxWidth`, or `minWidth` on a cell or its contents (EG: a nested `Text` component). You can even combine the `TextOverflow` component to implement ellipsis text overflow when text is cut off.

If you have a cell that contains something like a `Button` and you'd like the cell width to match the `Button` width exactly, you can set the `Cell` width to something really small (EG: `1px`). Due to how `<td>` elements determine their width, this will give us the desired result:

```tsx
<Table.Cell css={{ width: '1px' }}>
  <Flex>
    <Button size="s">
      <FeatherIcon icon="edit-2" size="xs" />
    </Button>
    <Button size="s" color="neutral">
      <FeatherIcon icon="trash-2" size="xs" />
    </Button>
  </Flex>
</Table.Cell>
```

## Wrapping Text

By default, the `Cell` component has `whiteSpace: 'nowrap'` set. If it makes sense to allow a certain cell to have wrapping text, you can use the `wrap` prop:

```tsx
...
<Table.Cell wrap css={{ minWidth: '15rem' }}>
  This content in here might be something super long that should be allowed to wrap.
</Table.Cell>
...
```

## Clickable Rows

Sometimes it makes sense for an entire table row to be clickable. You can apply the `clickable` prop to a `Row`:

```tsx
...
<Table.Row
  clickable
  onClick={() => {
    alert('Table Row Click');
  }}
  key={row.id}
>
  <Table.Cell>{row.id}</Table.Cell>
  <Table.Cell>{row.name}</Table.Cell>
  <Table.Cell>{row.favoriteColor}</Table.Cell>
</Table.Row>
...
```

## Clickable Cells

Sometimes it makes sense for individual cells to be clickable. You can apply the `clickable` prop to a `Cell`:

```tsx
...
<Table.Row key={row.id}>
  <Table.Cell
    clickable
    onClick={() => {
      alert('Table Cell Click 1');
    }}
  >
    {row.id}
  </Table.Cell>

  <Table.Cell
    clickable
    onClick={() => {
      alert('Table Cell Click 2');
    }}
  >
    {row.name}
  </Table.Cell>
</Table.Row>
...
```

## Clickable Rows + Some Clickable Cells

In rare cases, it might make sense to have an entire row be clickable, but maybe 1 or 2 cells be clickable individually as well:

```tsx
...
<Table.Row
  clickable
  onClick={() => {
    alert('Table Row Click');
  }}
  key={row.id}
>
  <Table.Cell
    clickable
    onClick={(event) => {
      event.stopPropagation();
      alert('Table Cell Click');
    }}
  >
    {row.id} (Cell Click)
  </Table.Cell>
  <Table.Cell>{row.name} (Row Click)</Table.Cell>
  <Table.Cell>{row.favoriteColor} (Row Click)</Table.Cell>
</Table.Row>
...
```

Note the use of `event.stopPropagation()` on the `Cell` click handler. This prevents the parent `Row` click handler from also firing.

## Sticky Header

By default, the `Header` uses sticky positioning that accounts for our main floating header. Sometimes you might want to disable the sticky positioning:

```tsx
...
<Table.Head sticky={false}>
  <Table.Row>
    <Table.HeaderCell>ID</Table.HeaderCell>
    <Table.HeaderCell>Name</Table.HeaderCell>
    <Table.HeaderCell>Favorite Color</Table.HeaderCell>
  </Table.Row>
</Table.Head>
...
```

Sometimes you might need to adjust the `top` positioning if your page doesn't render our main header:

```tsx
<Table.Head css={{ top: 0 }}>...</Table.Head>
```

## Custom Header

You can include custom content in the header at the top of the table using the `header` prop on `Table.Head`:

```tsx
<Table.Root>
  <Table.Head
    header={
      <Flex align="center">
        <FeatherIcon icon="sun" />
        <H5>My Cool Table</H5>
        <Button size="s" color="primaryBorder">
          <FeatherIcon icon="sliders" />
          Filter
        </Button>
      </Flex>
    }
  >
    ...
  </Table.Head>
  <Table.Body>...</Table.Body>
</Table.Root>
```

## Footer

You can use `Table.Foot` to create a sticky footer with more table data:

```tsx
<Table.Root>
  ...
  <Table.Foot>
    <Table.Row>
      <Table.Cell>Cell 2 Data</Table.Cell>
      <Table.Cell>Cell 1 Data</Table.Cell>
    </Table.Row>
  </Table.Foot>
</Table.Root>
```

Or you can use it to render custom content (EG: filter controls, pagination). You'll probably want to set `colSpan` on the `Table.Cell` to span the full width of the table:

```tsx
<Table.Root>
  ...
  <Table.Foot>
    <Table.Row>
      <Table.Cell colSpan={100}>
        <Flex>
          <Text>My Cool Footer</Text>
          <Button size="s" color="primaryBorder" css={{ marginLeft: 'auto' }}>
            <FeatherIcon icon="sliders" />
            Filter
          </Button>
        </Flex>
      </Table.Cell>
    </Table.Row>
  </Table.Foot>
</Table.Root>
```

You can disable the footer sticky scroll:

```tsx
<Table.Foot sticky={false}>...</Table.Foot>
```

## Row Flash

When working on a live updating table, sometimes it makes sense to animate new rows as they appear:

```tsx
import { DateTime } from 'luxon';
import { usePagination } from '@/hooks/pagination';

...

const pagination = usePagination();

function shouldFlashRow(alert: TriggeredAlert) {
  let result = false;

  if (pagination.state.liveRefreshEnabled) {
    const date = DateTime.fromISO(alert.triggeredAt);
    result = date > pagination.state.initialLoadDateTime;
  }

  return result;
}

...

<Table.Row flash={shouldFlashRow(row)}>...</Table.Row>
```

## Placeholder Rows

When data is loading for your table, you can use the `PlaceholderRows` component to show a loading placeholder:

```tsx
<Table.Body>
  {!myTableData && <Table.PlaceholderRows />}
  ...
</Table.Body>
```

## Infinite Scroll / Pagination

TODO...
