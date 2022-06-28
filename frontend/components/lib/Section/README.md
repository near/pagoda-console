# Section

This component will be used on almost every page. It sets proper padding, sets background color, sets max width for children and centers them (via `Container`), and renders a bottom border to separate multiple `Section` elements from each other.

## Example

```tsx
import { Section } from '@/components/lib/Section';
import { useDashboardLayout } from '@/hooks/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const MyPage: NextPageWithLayout = () => {
  return (
    <>
      <Section>...</Section>
      <Section>...</Section>
      <Section>...</Section>
    </>
  );
};

MyPage.getLayout = useDashboardLayout;

export default MyPage;
```

## Centered Page Section

Sometimes a page might need to have a horizontally and vertically centered section. You can accomplish this with `margin: auto` like so:

```tsx
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { useDashboardLayout } from '@/hooks/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const MyPage: NextPageWithLayout = () => {
  return (
    <Section css={{ margin: 'auto' }}>
      <Container size="s">
        <Flex stack gap="l">
          <H1>I Am Centered</H1>
          <Text>This will be centered vertically and horizontally on the page.</Text>
        </Flex>
      </Container>
    </Section>
  );
};

MyPage.getLayout = useDashboardLayout;

export default MyPage;
```

## No Border

Sometimes you might need to suppress the bottom border from showing:

```tsx
<Section noBorder>...</Section>
```

## Background Color

Sometimes it makes sense to use one of our other background colors (`surface3` is the default):

```tsx
<Section background="surface1">...</Section>
```

Be aware that depending on the background color you select, some components may no longer have proper contrast.
