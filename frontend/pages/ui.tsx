import { faAtlas, faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import * as Accordion from '@/components/lib/accordion';
import { Box } from '@/components/lib/box';
import { Button } from '@/components/lib/button';
import * as Dialog from '@/components/lib/dialog';
import { Flex } from '@/components/lib/flex';
import { H1, H2, H3, H4, H5, H6 } from '@/components/lib/heading';
import { HR } from '@/components/lib/hr';
import { P } from '@/components/lib/paragraph';
import { Section } from '@/components/lib/section';
import { Stack } from '@/components/lib/stack';
import { TextLink } from '@/components/lib/text-link';
import { ThemeToggle } from '@/components/theme-toggle/theme-toggle';
import { styled } from '@/styles/stitches';
import type { NextPageWithLayout } from '@/utils/types';

const Block = styled('div', {
  width: '15rem',
  height: '2rem',
  background: 'var(--color-surface-3)',
});

const Settings: NextPageWithLayout = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Section color="primary">
        <Flex justify="spaceBetween" align="center">
          <div>
            <H1>Stitches & Radix UI</H1>
            <P>This page shows examples of all our shared components.</P>
          </div>

          <ThemeToggle />
        </Flex>
      </Section>

      <Section>
        <H2>Accordion</H2>

        <Accordion.Root type="multiple" defaultValue={['item-1']}>
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
        <H2>Box</H2>

        <Box>
          <Stack>
            <H3>This is a box.</H3>
            <P>Here is some content.</P>
          </Stack>
        </Box>
      </Section>

      <Section>
        <H2>Button</H2>

        <Flex wrap>
          <Button>Primary</Button>
          <Button>
            <FontAwesomeIcon icon={faAtlas} /> With Icon
          </Button>
          <Button>
            <FontAwesomeIcon icon={faCar} />
          </Button>
          <Button loading>Is Loading</Button>
          <Button disabled>Disabled</Button>
          <Button color="danger">Danger</Button>
          <Button color="neutral">Neutral</Button>
          <Button color="neutral" size="small">
            Small
          </Button>
          <Button color="neutral" size="small" loading>
            Small
          </Button>
        </Flex>
      </Section>

      <Section>
        <H2>Dialog</H2>

        <P>Open/close via trigger:</P>

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button>Trigger</Button>
          </Dialog.Trigger>

          <Dialog.Content title="Hello There">
            <Button
              onClick={() => {
                setDialogIsOpen(true);
              }}
            >
              Open Another Modal
            </Button>
            <P>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet in,
              tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus non.
              Integer dignissim, orci eget egestas mattis, eros lacus auctor diam, id elementum ipsum nulla ac dolor.
              Pellentesque placerat lectus eget turpis rutrum, vitae placerat ex eleifend. Cras vitae tellus ultricies
              nisl congue molestie. Quisque id varius nisi, quis pretium metus. Donec fringilla massa in diam ultrices
              pretium. Suspendisse ut quam in erat tincidunt mollis. Maecenas pulvinar, arcu eu sodales imperdiet,
              mauris orci pellentesque quam, quis fermentum sapien risus nec nulla.
            </P>
            <P>
              Vestibulum vel viverra sem. Suspendisse nec nisi turpis. Curabitur tristique magna sed turpis ullamcorper
              commodo. Nunc mattis mi sed ex pretium, et iaculis odio facilisis. Maecenas tempor nulla magna, quis
              dignissim magna convallis blandit. Sed convallis sapien risus, at tincidunt justo blandit vitae. Aliquam
              erat volutpat. Duis blandit metus mauris, vitae lacinia nibh lobortis eu. Donec et sagittis ligula. Morbi
              et consequat nibh, nec cursus mauris. Sed dapibus lectus nec felis porta dictum. Duis ac blandit justo,
              sed facilisis ante. Fusce eleifend turpis leo, a ultricies quam mattis ac. Mauris sagittis, urna et
              malesuada facilisis, augue elit suscipit nunc, ut accumsan mi urna a eros. Maecenas blandit hendrerit
              malesuada.
            </P>
            <P>
              Quisque risus velit, consectetur in commodo in, ultrices ut est. Suspendisse est diam, commodo non luctus
              nec, pellentesque et ex. Etiam at velit porta, malesuada odio ut, lobortis libero. Quisque pretium, quam
              sit amet suscipit tempor, enim quam volutpat lacus, in pharetra nunc magna quis dui. Praesent elementum
              pulvinar consectetur. Nunc non bibendum erat, vel eleifend sapien. Etiam nec auctor ligula, ut scelerisque
              risus. Integer ac eros nec eros eleifend rutrum sit amet at sapien. In lacinia sem ac neque rhoncus, quis
              finibus sapien ultricies. Sed varius non orci a consectetur. Duis ut blandit justo, tincidunt vulputate
              neque. Ut placerat turpis in eleifend dignissim.
            </P>
          </Dialog.Content>
        </Dialog.Root>

        <HR />

        <P>Open/close via control:</P>

        <Button
          onClick={() => {
            setDialogIsOpen(true);
          }}
        >
          Controlled
        </Button>

        <Dialog.Root open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
          <Dialog.Content>
            <P>This is controlled content.</P>
            <Dialog.Close asChild>
              <Button>Closer</Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
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
              <Block />
              <Block />
              <Block />
            </Flex>
          </Stack>

          <HR />

          <Stack>
            <P>Custom Gap & Justify</P>

            <Flex gap="xl" justify="end">
              <Block />
              <Block />
              <Block />
            </Flex>
          </Stack>

          <HR />

          <Stack>
            <P>Wrap</P>

            <Flex wrap>
              <Block />
              <Block />
              <Block />
              <Block />
              <Block />
              <Block />
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
              <Block />
              <Block />
              <Block />
            </Stack>
          </Stack>

          <HR />

          <Stack>
            <P>Custom Gap</P>

            <Stack gap="xs">
              <Block />
              <Block />
              <Block />
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

      <Section color="primary">
        <H2>Section</H2>

        <P>This is wrapped in a primary color section.</P>
      </Section>

      <Section>
        <Stack>
          <H2>Text Link</H2>
          <P>
            Here are some links: <TextLink href="#">Primary Link</TextLink> and{' '}
            <TextLink color="danger" href="#">
              Danger Link
            </TextLink>{' '}
            and{' '}
            <TextLink color="neutral" href="#">
              Neutral Link
            </TextLink>
          </P>
        </Stack>
      </Section>
    </>
  );
};

export default Settings;
