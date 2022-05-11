import * as Accordion from '@/components/lib/accordion';
import { Button } from '@/components/lib/button';
import { Flex } from '@/components/lib/flex';
import { H1, H2, H3, H4, H5, H6 } from '@/components/lib/heading';
import { HR } from '@/components/lib/hr';
import { P } from '@/components/lib/paragraph';
import { Section } from '@/components/lib/section';
import { Stack } from '@/components/lib/stack';
import { TextLink } from '@/components/lib/text-link';
import { styled } from '@/styles/theme';
import type { NextPageWithLayout } from '@/utils/types';

const Box = styled('div', {
  width: '15rem',
  height: '2rem',
  background: '$surface3',
});

const Settings: NextPageWithLayout = () => {
  return (
    <>
      <Section color="primary">
        <H1>Stitches & Radix UI</H1>
        <P>This page shows examples of all our shared components.</P>
      </Section>

      <Section>
        <H2>Accordion</H2>

        <Accordion.Root type="single" defaultValue="item-1" collapsible>
          <Accordion.Item value="item-1">
            <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
            <Accordion.Content>
              <P>Yes. It adheres to the WAI-ARIA design pattern.</P>
              <P>Here is another paragraph.</P>

              <div>
                <Button>Click Me</Button>
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-2">
            <Accordion.Trigger>Is it unstyled?</Accordion.Trigger>
            <Accordion.Content>
              <P>Yes. It is unstyled by default, giving you freedom over the look and feel.</P>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-3">
            <Accordion.Trigger>Can it be animated?</Accordion.Trigger>
            <Accordion.Content>
              <P>Yes! You can animate the Accordion with CSS or JavaScript.</P>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </Section>

      <Section>
        <H2>Button</H2>

        <Flex>
          <Button>Standard</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="secondary" size="small">
            Small
          </Button>
        </Flex>
      </Section>

      <Section>
        <H2>Heading</H2>

        <H1>Heading 1</H1>
        <H2>Heading 2</H2>
        <H3>Heading 3</H3>
        <H4>Heading 4</H4>
        <H5>Heading 5</H5>
        <H6>Heading 6</H6>
      </Section>

      <Section>
        <H2>Horizontal Rule</H2>

        <P>Here is some content split with a horizontal rule.</P>

        <HR />

        <P>Here is more content.</P>
      </Section>

      <Section>
        <Stack gap="l">
          <H2>Layout - Flex</H2>

          <Stack>
            <P>Default</P>

            <Flex>
              <Box />
              <Box />
              <Box />
            </Flex>
          </Stack>

          <HR />

          <Stack>
            <P>Custom Gap & Justify</P>

            <Flex gap="xl" justify="end">
              <Box />
              <Box />
              <Box />
            </Flex>
          </Stack>

          <HR />

          <Stack>
            <P>Wrap</P>

            <Flex wrap>
              <Box />
              <Box />
              <Box />
              <Box />
              <Box />
              <Box />
              <Box />
              <Box />
            </Flex>
          </Stack>
        </Stack>
      </Section>

      <Section>
        <Stack gap="l">
          <H2>Layout - Stack</H2>

          <Stack>
            <P>Default</P>

            <Stack>
              <Box />
              <Box />
              <Box />
            </Stack>
          </Stack>

          <HR />

          <Stack>
            <P>Custom Gap</P>

            <Stack gap="xs">
              <Box />
              <Box />
              <Box />
            </Stack>
          </Stack>
        </Stack>
      </Section>

      <Section>
        <Stack>
          <H2>Paragraph</H2>
          <P size="small">A small paragraph.</P>
          <P>A standard paragraph.</P>
          <P size="large">A large paragraph.</P>
        </Stack>
      </Section>

      <Section>
        <H2>Section</H2>

        <p>This is wrapped in a section.</p>
      </Section>

      <Section>
        <Stack>
          <H2>Text Link</H2>
          <P>
            Here are some links: <TextLink href="#">Primary Link</TextLink> and{' '}
            <TextLink color="secondary" href="#">
              Secondary Link
            </TextLink>
          </P>
        </Stack>
      </Section>
    </>
  );
};

export default Settings;
