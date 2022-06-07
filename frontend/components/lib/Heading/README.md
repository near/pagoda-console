# Heading

This folder exposes components for `<h1> - <h6>` tags.

## Examples

```tsx
import { H1, H2, H3, H4, H5, H6 } from '@/components/lib/Heading';

...

<H1>Heading 1</H1>
<H2>Heading 2</H2>
<H3>Heading 3</H3>
<H4>Heading 4</H4>
<H5>Heading 5</H5>
<H6>Heading 6</H6>
```

## Using as a Link

Sometimes it can make sense to convert a `Heading` component (or any text component for that matter) in to an `<a>` element. You can do that using the `as` property (which all Stitches components support):

```tsx
<H4
  as="a"
  css={{
    display: 'block',
    width: '100%',
    transition: 'var(--transitions)',
    '&:hover': {
      color: 'var(--color-primary)',
    },
    '&:focus': {
      outline: 'var(--focus-outline)',
      outlineOffset: 'var(--focus-outline-offset)',
    },
  }}
>
  Heading Text
</H4>
```
