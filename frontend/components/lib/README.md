# UI Library

This project uses [Radix](https://www.radix-ui.com/) and [Stitches](https://stitches.dev/). We have built out a library of generic, reusable components inside this `lib` folder.

You can view all of these components by visiting `/ui` in your browser when running the server locally or on the [development server](https://dev.console.pagoda.co/ui). The `/ui` route is hidden in production.

## Component Documentation

Most of our components have their own `README.md` file that go over different examples and options when using the component. For example: [Accordion](./Accordion/README.md). We're still working on adding documentation - so some of our components might be lacking a `README.md` file.

All of our components are rendered with examples in [pages/ui.tsx](../../pages/ui.tsx). You can always reference the code in this file to view examples of using the components.

## Escape Hatch

We've done our best to build a versatile set of components. However, you will likely run in to scenarios where you need to build something custom inside your respective `modules/{feature}/components` folder - and that's okay. This is a huge reason for why we opted to use [Radix](https://www.radix-ui.com/) and [Stitches](https://stitches.dev/). You can implement your own components using Radix primitives directly in combination with Stitches for styling when our generic components don't meet your needs.

Please feel free to copy the source code from any of our library components for a good starting point. The [Section](./Section/) component will give you a really simple template to start with.

## Suggesting New Components

If you end up creating a component that you feel could be a good candidate to add to our shared UI library, please let us know by opening an issue on our main repository with the `ui-library` label: https://github.com/near/developer-console-framework/issues

## Feedback

Feel free to open up an issue on our main repository with any feedback, questions, or bugs pertaining to the UI library: https://github.com/near/developer-console-framework/issues

Please use the `ui-library` label when creating an issue related to our shared UI library.

## Styling

There are multiple ways you can approach styles and overrides based on your needs (please review [Stitches](https://stitches.dev/) documentation for more information on the following options):

1. Overriding an existing Stitches component with the `css` property:

```tsx
import { Box } from '@/components/lib/Box';
...
<Box
  css={{
    display: 'flex',
    flexDirection: 'column',
  }}
>
  This is some content
</Box>
```

2. Creating a new Stitches component via `@/styles/stitches`:

```ts
import { styled } from '@/styles/stitches';

export const MyElement = styled('div', {
  background: 'var(--color-surface-1)',
});
```

3. Extending an existing Stitches component via `@/styles/stitches`:

```ts
import { Box } from '@/components/lib/Box';
import { styled } from '@/styles/stitches';

export const MyElement = styled(Box, {
  background: 'var(--color-surface-1)',
});
```

4. Creating variants for your Stitches components:

```tsx
import { styled } from '@/styles/stitches';

const MyElement = styled('div', {
  background: 'var(--color-surface-1)',

  variants: {
    padding: {
      s: {
        padding: 'var(--space-s)',
      },
      m: {
        padding: 'var(--space-m)',
      },
      l: {
        padding: 'var(--space-l)',
      },
    },
  },
});

...

<MyElement padding="s" />
<MyElement padding="m" />
<MyElement padding="l" />
```

### Variables

In order to maintain flexibility and simplicity, we use native [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (AKA variables) for all of our theme variables instead of using Stitches theme tokens. You can view all of the globally available variables in [styles/variables.css](../../styles/variables.css). You can reference these variables in any of your styles. For example:

```ts
import { styled } from '@/styles/stitches';

export const MyElement = styled('div', {
  background: 'var(--color-surface-1)',
});
```

> NOTE: It's important to use our CSS variables for setting colors due to our app supporting dark and light mode. Using a hardcoded color should always be avoided except for very rare cases.

### Theme Utility Classes

In rare cases, it might be desirable to style a certain UI section with a specific theme regardless of the current dark/light mode setting. The following utility classes are defined in [styles/variables.css](../../styles/variables.css) and modify CSS property values for the elements nested within.

- `.dark-theme`: Style all children with dark theme colors.
- `.light-theme`: Style all children with light theme colors.
- `.reverse-theme`: Style all children with the reverse of the current theme colors. If the current theme is light, the dark theme colors will be applied. If the current theme is dark, the light theme colors will be applied.

This would look something like:

```tsx
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
...
<Section className="dark-theme">
  <Text>This section will always be dark.</Text>
</Section>
```

### Breakpoints

Due to our app primarily targeting desktop/laptop users, our default styles should target large screens. That means our breakpoints are implemented with `max-width`, like so:

```
mobile: '(max-width: 30rem)',
tablet: '(max-width: 60rem)',
```

Even though we don't use Stitches theme API for things like colors and fonts, it's extremely useful for sharing predefined breakpoints. Right now we have support for two Stitches breakpoints (defined in [styles/stiches.ts](../../styles/stitches.ts)):

`@mobile`: For devices smaller than a tablet
`@tablet`: For devices smaller than a desktop/laptop

These breakpoint theme tokens can be used in really cool ways with Stitches.

1. Applying styles to a new element at a certain breakpoint:

```ts
import { styled } from '@/styles/stitches';

export const MyElement = styled('div', {
  flexDirection: 'row',

  '@mobile': {
    flexDirection: 'column',
  },
});
```

2. Applying styles to an element via the `css` property a certain breakpoint:

```tsx
import { Flex } from '@/components/lib/Flex';
...
<Flex
  css={{
    '@mobile': {
      flexDirection: 'column'
    },
  }}
>
  This is some content
</Flex>
```

3. Setting Stitches variant property values based on a certain breakpoint:

```tsx
import { Flex } from '@/components/lib/Flex';
...
<Flex stack={{
  '@tablet': true,
}}>...</Flex>
```
