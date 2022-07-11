import { useCombobox } from 'downshift';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import * as Accordion from '@/components/lib/Accordion';
import { Badge } from '@/components/lib/Badge';
import { Box } from '@/components/lib/Box';
import { Button, ButtonLink } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { Checkbox, CheckboxGroup } from '@/components/lib/Checkbox';
import * as CheckboxCard from '@/components/lib/CheckboxCard';
import { CodeBlock } from '@/components/lib/CodeBlock';
import * as Combobox from '@/components/lib/Combobox';
import { Container } from '@/components/lib/Container';
import * as Dialog from '@/components/lib/Dialog';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1, H2, H3, H4, H5, H6 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Info } from '@/components/lib/Info';
import { List, ListItem } from '@/components/lib/List';
import { Message } from '@/components/lib/Message';
import { Placeholder } from '@/components/lib/Placeholder';
import * as Popover from '@/components/lib/Popover';
import { Progress } from '@/components/lib/Progress';
import { Section } from '@/components/lib/Section';
import * as Slider from '@/components/lib/Slider';
import { Spinner } from '@/components/lib/Spinner';
import { SvgIcon } from '@/components/lib/SvgIcon';
import { Switch } from '@/components/lib/Switch';
import * as Table from '@/components/lib/Table';
import * as Tabs from '@/components/lib/Tabs';
import { Text } from '@/components/lib/Text';
import { TextButton, TextLink } from '@/components/lib/TextLink';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { openToast } from '@/components/lib/Toast';
import { Tooltip } from '@/components/lib/Tooltip';
import { ThemeToggle } from '@/modules/core/components/ThemeToggle/ThemeToggle';
import ExampleIcon from '@/public/images/icons/ui-example.svg';
import { styled } from '@/styles/stitches';
import config from '@/utils/config';
import { formValidations } from '@/utils/constants';
import { mergeInputProps } from '@/utils/merge-input-props';
import type { NextPageWithLayout } from '@/utils/types';

const Block = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '15rem',
  height: '3rem',
  background: 'var(--color-surface-1)',
  borderRadius: 'var(--border-radius-m)',

  variants: {
    stretch: {
      true: {
        width: '100%',
      },
    },
  },
});

const Lipsum = () => {
  return (
    <>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet in,
        tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus non. Integer
        dignissim, orci eget egestas mattis, eros lacus auctor diam, id elementum ipsum nulla ac dolor. Pellentesque
        placerat lectus eget turpis rutrum, vitae placerat ex eleifend. Cras vitae tellus ultricies nisl congue
        molestie. Quisque id varius nisi, quis pretium metus.
      </Text>
      <Text>
        Donec fringilla massa in diam ultrices pretium. Suspendisse ut quam in erat tincidunt mollis. Maecenas pulvinar,
        arcu eu sodales imperdiet, mauris orci pellentesque quam, quis fermentum sapien risus nec nulla.
      </Text>
      <Text>
        Vestibulum vel viverra sem. Suspendisse nec nisi turpis. Curabitur tristique magna sed turpis ullamcorper
        commodo. Nunc mattis mi sed ex pretium, et iaculis odio facilisis. Maecenas tempor nulla magna, quis dignissim
        magna convallis blandit. Sed convallis sapien risus, at tincidunt justo blandit vitae. Aliquam erat volutpat.
        Duis blandit metus mauris, vitae lacinia nibh lobortis eu.
      </Text>
      <Text>
        Donec et sagittis ligula. Morbi et consequat nibh, nec cursus mauris. Sed dapibus lectus nec felis porta dictum.
        Duis ac blandit justo, sed facilisis ante. Fusce eleifend turpis leo, a ultricies quam mattis ac. Mauris
        sagittis, urna et malesuada facilisis, augue elit suscipit nunc, ut accumsan mi urna a eros. Maecenas blandit
        hendrerit malesuada.
      </Text>
      <Text>
        Quisque risus velit, consectetur in commodo in, ultrices ut est. Suspendisse est diam, commodo non luctus nec,
        pellentesque et ex. Etiam at velit porta, malesuada odio ut, lobortis libero. Quisque pretium, quam sit amet
        suscipit tempor, enim quam volutpat lacus, in pharetra nunc magna quis dui. Praesent elementum pulvinar
        consectetur.
      </Text>
      <Text>
        Nunc non bibendum erat, vel eleifend sapien. Etiam nec auctor ligula, ut scelerisque risus. Integer ac eros nec
        eros eleifend rutrum sit amet at sapien. In lacinia sem ac neque rhoncus, quis finibus sapien ultricies. Sed
        varius non orci a consectetur. Duis ut blandit justo, tincidunt vulputate neque. Ut placerat turpis in eleifend
        dignissim.
      </Text>
    </>
  );
};

const books = [
  { author: 'Harper Lee', title: 'To Kill a Mockingbird' },
  { author: 'Lev Tolstoy', title: 'War and Peace' },
  { author: 'Fyodor Dostoyevsy', title: 'The Idiot' },
  { author: 'Oscar Wilde', title: 'A Picture of Dorian Gray' },
  { author: 'George Orwell', title: '1984' },
  { author: 'Jane Austen', title: 'Pride and Prejudice' },
  { author: 'Marcus Aurelius', title: 'Meditations' },
  { author: 'Fyodor Dostoevsky', title: 'The Brothers Karamazov' },
  { author: 'Lev Tolstoy', title: 'Anna Karenina' },
  { author: 'Fyodor Dostoevsky', title: 'Crime and Punishment' },
];

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
    display: 'Snow (Disabled)',
    icon: 'cloud-snow',
    disabled: true,
  },
];

const favoriteIconOptions = [
  {
    id: '1',
    title: 'Icon 1',
    description: 'Icon 1 description goes here',
    icon: 'cloud-lightning',
  },
  {
    id: '2',
    title: 'Icon 2',
    description: 'Icon 2 description goes here',
    icon: 'sun',
  },
  {
    id: '3',
    title: 'Icon 3',
    description: 'This option is disabled',
    icon: 'cloud-snow',
    disabled: true,
  },
];

const favoriteFoodOptions = [
  {
    display: 'Pizza',
    value: 'pizza',
    description: 'Pepperoni pizza is delicious.',
  },
  {
    display: 'Taco',
    value: 'taco',
    description: 'Taco Tuesday!',
  },
  {
    display: 'Pasta',
    value: 'pasta',
    description: 'Spaghetti & meatballs with extra parmesan cheese.',
  },
];

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

const Settings: NextPageWithLayout = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [bookmarksChecked, setBookmarksChecked] = useState(true);
  const [urlsChecked, setUrlsChecked] = useState(false);
  const [progressValue, setProgressValue] = useState(10);
  const [person, setPerson] = useState('pedro');
  const [errorMessage, setErrorMessage] = useState('This is a dismissable error message');
  const router = useRouter();

  useEffect(() => {
    // Don't allow users to visit /ui in production
    if (config.deployEnv === 'PRODUCTION') {
      router.replace('/');
    }
  }, [router]);

  return (
    <>
      <Section background="surface2">
        <Flex align="center" justify="spaceBetween" wrap>
          <Flex stack css={{ width: 'auto' }}>
            <H1>Stitches & Radix UI</H1>
            <Text>This page shows examples of all our shared components.</Text>
          </Flex>

          <ThemeToggle css={{ width: 'auto' }} />
        </Flex>
      </Section>

      <DocSection title="Accordion">
        <H4>Standard</H4>

        <Accordion.Root type="multiple">
          <Accordion.Item value="item-1">
            <Accordion.Trigger>Section One</Accordion.Trigger>
            <Accordion.Content>
              <Flex stack>
                <Text>Here is a paragraph.</Text>
                <Button>Click Me</Button>
              </Flex>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-2">
            <Accordion.Trigger>Section Two</Accordion.Trigger>
            <Accordion.Content>
              <Flex stack>
                <Text>Here is a paragraph.</Text>
              </Flex>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-3">
            <Accordion.Trigger disabled>Section 3 - Disabled</Accordion.Trigger>
            <Accordion.Content>
              <Flex stack>
                <Text>This whole area is disabled.</Text>
              </Flex>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        <H4>No Arrow</H4>

        <Accordion.Root type="multiple" noArrow>
          <Accordion.Item value="item-1">
            <Accordion.Trigger>Section One</Accordion.Trigger>
            <Accordion.Content>
              <Flex stack>
                <Text>Here is another paragraph.</Text>
              </Flex>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-1">
            <Accordion.Trigger>Section Two</Accordion.Trigger>
            <Accordion.Content>
              <Flex stack>
                <Text>Here is another paragraph.</Text>
              </Flex>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        <H4>Inline</H4>

        <Accordion.Root type="multiple" inline>
          <Accordion.Item value="item-1">
            <Accordion.Trigger>
              <FeatherIcon icon="zap" size="m" />
              <Text size="h4" color="current">
                Section One
              </Text>
            </Accordion.Trigger>
            <Accordion.Content>
              <Flex stack>
                <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
                <Text>Here is another paragraph.</Text>

                <div>
                  <Button>Click Me</Button>
                </div>
              </Flex>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-2">
            <Accordion.Trigger>
              <FeatherIcon icon="eye" size="m" />
              <Text size="h4" color="current">
                Section Two
              </Text>
            </Accordion.Trigger>
            <Accordion.Content>
              <Flex stack>
                <Text>Here is another paragraph.</Text>
              </Flex>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-3">
            <Accordion.Trigger disabled>
              <FeatherIcon icon="circle" size="m" />
              <Text size="h4" color="current">
                Section Three - Disabled
              </Text>
            </Accordion.Trigger>
            <Accordion.Content>
              <Flex stack>
                <Text>This whole area is disabled.</Text>
              </Flex>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </DocSection>

      <DocSection title="Badge">
        <Flex align="center">
          <H3
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-s)',
              flexWrap: 'wrap',
            }}
          >
            With a Badge
            <Badge>Neutral</Badge>
            <Badge color="primary">Primary</Badge>
            <Badge color="danger">Danger</Badge>
            <Badge size="s">Small</Badge>
          </H3>
        </Flex>
      </DocSection>

      <DocSection title="Box">
        <Box
          css={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-m)',
            borderRadius: 'var(--border-radius-l)',
            border: '1px dashed var(--color-cta-primary)',
          }}
        >
          <H4>This is a box.</H4>
          <Text>A box is an unstyled div that you can apply your own styles to via the css prop.</Text>
        </Box>
      </DocSection>

      <DocSection title="Button">
        <Flex wrap>
          <Button>Primary</Button>
          <Button>
            <FeatherIcon icon="cpu" /> With Icon
          </Button>
          <Button>
            <FeatherIcon icon="eye" aria-label="Eye" />
          </Button>
          <Button loading>Is Loading</Button>
          <Button disabled>Disabled</Button>
          <Button color="danger">Danger</Button>
          <Button color="primaryBorder">Primary Border</Button>
          <Button color="dangerBorder">Danger Border</Button>
          <Button color="neutral">Neutral</Button>
          <Button color="transparent">Transparent</Button>
        </Flex>

        <Flex wrap>
          <Button color="neutral" size="s">
            Small
          </Button>
          <Button color="neutral" size="s" loading>
            Small
          </Button>
        </Flex>

        <H4>ButtonLink</H4>
        <Flex wrap>
          <Link href="/project-settings" passHref>
            <ButtonLink>Link</ButtonLink>
          </Link>
          <ButtonLink href="https://github.com/near/developer-console-framework" external>
            External Link
          </ButtonLink>

          <ButtonLink href="https://github.com/near/developer-console-framework" external size="s">
            External Link - Small
          </ButtonLink>
        </Flex>
      </DocSection>

      <DocSection title="Card">
        <Flex
          stack={{
            '@tablet': true,
          }}
        >
          <Card>
            <Flex stack>
              <FeatherIcon icon="box" size="m" />
              <H4>Standard Card</H4>
              <Text>Cards can contain anything.</Text>
            </Flex>
          </Card>

          <Card clickable as="button" type="button" onClick={() => alert('Click!')}>
            <Flex stack>
              <FeatherIcon icon="box" size="m" color="primary" />
              <H4>Clickable Card</H4>
              <Text>Cards can be clickable.</Text>
            </Flex>
          </Card>

          <Card clickable as="button" type="button" disabled>
            <Flex stack>
              <FeatherIcon icon="box" size="m" color="primary" />
              <H4>Disabled Card</H4>
              <Text>This card is disabled.</Text>
            </Flex>
          </Card>
        </Flex>

        <Flex
          stack={{
            '@tablet': true,
          }}
        >
          <Card borderRadius="s">
            <H5>Radius S</H5>
          </Card>

          <Card borderRadius="m">
            <H5>Radius M</H5>
          </Card>

          <Card borderRadius="l">
            <H5>Radius L</H5>
          </Card>

          <Card borderRadius="xl">
            <H5>Radius XL</H5>
          </Card>
        </Flex>

        <Flex
          stack={{
            '@tablet': true,
          }}
        >
          <Card padding="s">
            <H5>Padding S</H5>
          </Card>

          <Card padding="m">
            <H5>Padding M</H5>
          </Card>

          <Card padding="l">
            <H5>Padding L</H5>
          </Card>

          <Card padding="xl">
            <H5>Padding XL</H5>
          </Card>
        </Flex>
      </DocSection>

      <DocSection title="Checkbox / Radio">
        <H4>Single Checkbox</H4>

        <Checkbox>
          I agree to the{' '}
          <TextLink href="/" target="_blank">
            Terms & Conditions
          </TextLink>
        </Checkbox>

        <H4>Group (Checkbox)</H4>

        <CheckboxGroup aria-label="Select your favorite foods">
          {favoriteFoodOptions.map((option) => (
            <Checkbox key={option.value} value={option.value} name={`exampleCheckbox1${option.value}`}>
              {option.display}
              <Text size="bodySmall">{option.description}</Text>
            </Checkbox>
          ))}
        </CheckboxGroup>

        <H4>Group (Radio)</H4>

        <CheckboxGroup aria-label="Select your favorite food">
          {favoriteFoodOptions.map((option) => (
            <Checkbox radio key={option.value} value={option.value} name="exampleRadio1">
              {option.display}
              <Text size="bodySmall">{option.description}</Text>
            </Checkbox>
          ))}
        </CheckboxGroup>
      </DocSection>

      <DocSection title="Checkbox / Radio Card">
        <H4>Card Group (Checkbox)</H4>

        <CheckboxCard.Group aria-label="Select your favorite icons">
          {favoriteIconOptions.map((option) => (
            <CheckboxCard.Card
              key={option.id}
              disabled={option.disabled}
              value={option.id}
              name={`exampleCheckboxCard1${option.id}`}
            >
              <FeatherIcon icon={option.icon} />
              <CheckboxCard.Title>{option.title}</CheckboxCard.Title>
              <CheckboxCard.Description>{option.description}</CheckboxCard.Description>
            </CheckboxCard.Card>
          ))}
        </CheckboxCard.Group>

        <H4>Card Group (Radio)</H4>

        <CheckboxCard.Group aria-label="Select your favorite icon">
          {favoriteIconOptions.map((option) => (
            <CheckboxCard.Card
              radio
              key={option.id}
              disabled={option.disabled}
              value={option.id}
              name="exampleRadioCard1"
            >
              <FeatherIcon icon={option.icon} />
              <CheckboxCard.Title>{option.title}</CheckboxCard.Title>
              <CheckboxCard.Description>{option.description}</CheckboxCard.Description>
            </CheckboxCard.Card>
          ))}
        </CheckboxCard.Group>
      </DocSection>

      <DocSection title="Code Block">
        <CodeBlock language="json" showLineNumbers={true}>
          {JSON.stringify(
            {
              age: 45,
              favoriteColor: 'orange',
              name: 'Peyton Manning',
              isQuarterback: true,
            },
            null,
            4,
          )}
        </CodeBlock>
      </DocSection>

      <DocSectionCombobox />

      <DocSection title="Container">
        <Container size="xxs">
          <Block stretch>
            <Text>xxs</Text>
          </Block>
        </Container>

        <Container size="xs">
          <Block stretch>
            <Text>xs</Text>
          </Block>
        </Container>

        <Container size="s">
          <Block stretch>
            <Text>s</Text>
          </Block>
        </Container>

        <Container size="m">
          <Block stretch>
            <Text>m</Text>
          </Block>
        </Container>

        <Container size="l">
          <Block stretch>
            <Text>l</Text>
          </Block>
        </Container>
      </DocSection>

      <DocSection title="Dialog">
        <Text>Open/close via trigger:</Text>

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button>Trigger</Button>
          </Dialog.Trigger>

          <Dialog.Content title="Your Modal Title" size="s">
            <Flex stack>
              <H4>This is a small modal with a default title and close button.</H4>
              <Button
                onClick={() => {
                  setDialogIsOpen(true);
                }}
              >
                Open Another Modal
              </Button>
              <HR />
              <Lipsum />
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        <HR />

        <Text>Open/close via control:</Text>

        <Button
          onClick={() => {
            setDialogIsOpen(true);
          }}
        >
          Controlled
        </Button>

        <Dialog.Root open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
          <Dialog.Content>
            <Flex stack>
              <H1>Controlled</H1>
              <Text>
                This is a controlled dialog. You can ommit the title prop to avoid rendering the default title and close
                button - this would allow you to render your own.
              </Text>
              <Dialog.Close asChild>
                <Button>Close Me</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </DocSection>

      <DocSection title="Dropdown Menu">
        <Flex wrap>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button>Custom Trigger</Button>
            </DropdownMenu.Trigger>

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

          <DropdownMenu.Root>
            <DropdownMenu.Button>Standard</DropdownMenu.Button>
            <DropdownMenu.Content>
              <DropdownMenu.Item>New Tab</DropdownMenu.Item>
              <DropdownMenu.Item disabled>New Window</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Button css={{ width: '20rem' }}>
              <TextOverflow>Size + Trucation - This Text Will Get Cut Off</TextOverflow>
            </DropdownMenu.Button>
            <DropdownMenu.Content>
              <DropdownMenu.Item>New Tab</DropdownMenu.Item>
              <DropdownMenu.Item disabled>New Window</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Button size="s">Small</DropdownMenu.Button>
            <DropdownMenu.Content>
              <DropdownMenu.Item>New Tab</DropdownMenu.Item>
              <DropdownMenu.Item disabled>New Window</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </DocSection>

      <DocSection title="Feather Icon">
        <Text>
          View all Feather Icons{' '}
          <TextLink href="https://feathericons.com/" target="_blank">
            here
          </TextLink>
          .
        </Text>

        <Flex>
          <FeatherIcon icon="home" size="xl" />
          <FeatherIcon icon="home" size="l" />
          <FeatherIcon icon="home" size="m" />
          <FeatherIcon icon="home" size="s" />
          <FeatherIcon icon="home" size="xs" />
        </Flex>

        <Flex>
          <Text css={{ color: 'orange' }}>
            <FeatherIcon icon="cpu" />
          </Text>
          <FeatherIcon icon="cpu" color="primary" />
          <FeatherIcon icon="cpu" color="danger" />
          <FeatherIcon icon="cpu" color="text1" />
          <FeatherIcon icon="cpu" color="text2" />
          <FeatherIcon icon="cpu" color="text3" />
        </Flex>

        <Flex>
          <FeatherIcon icon="eye" strokeWidth={3} />
          <FeatherIcon icon="eye" strokeWidth={2} />
          <FeatherIcon icon="eye" strokeWidth={1} />
        </Flex>
      </DocSection>

      <DocSection title="Flex">
        <Flex stack>
          <Text>Default</Text>

          <Flex>
            <Block />
            <Block />
            <Block />
          </Flex>
        </Flex>

        <HR />

        <Flex stack>
          <Text>Custom Gap & Justify</Text>

          <Flex gap="xl" justify="end">
            <Block />
            <Block />
            <Block />
          </Flex>
        </Flex>

        <HR />

        <Flex stack>
          <Text>Stack</Text>

          <Flex stack>
            <Block />
            <Block />
            <Block />
          </Flex>
        </Flex>

        <Flex stack>
          <Text>Breakpoint Stack</Text>

          <Flex
            stack={{
              '@tablet': true,
            }}
          >
            <Block />
            <Block />
            <Block />
          </Flex>
        </Flex>

        <HR />

        <Flex stack>
          <Text>Wrap</Text>

          <Flex wrap>
            <Block />
            <Block />
            <Block />
            <Block />
            <Block />
            <Block />
          </Flex>
        </Flex>
      </DocSection>

      <DocSectionForm />

      <DocSection title="Heading">
        <H1>Heading 1</H1>
        <H2>Heading 2</H2>
        <H3>Heading 3</H3>
        <H4>Heading 4</H4>
        <H5>Heading 5</H5>
        <H6>Heading 6</H6>
      </DocSection>

      <DocSection title="Horizontal Rule">
        <Text>Here is some content split with a horizontal rule.</Text>

        <HR />

        <Text>Here is more content.</Text>
      </DocSection>

      <DocSection title="Info">
        <Text>
          An info component renders a help circle icon that opens a tooltip with more context when hovered. Clicking the
          icon will toggle the tooltip.
        </Text>

        <Flex align="center">
          <H4>Contract ABI</H4>{' '}
          <Info
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet in,
              tincidunt ac sem."
          />
        </Flex>
      </DocSection>

      <DocSection title="List">
        <List>
          <ListItem>Here is the first item.</ListItem>
          <ListItem>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet in,
            tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus non.
          </ListItem>
        </List>

        <H5>Ordered</H5>

        <List as="ol">
          <ListItem>Here is the first item.</ListItem>
          <ListItem>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet in,
            tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus non.
          </ListItem>
        </List>
      </DocSection>

      <DocSection title="Message">
        <Message content="Here is an info message." />
        <Message type="error" content="Here is an error message." />
        <Message type="success" content="Here is a success message." />
        <Message type="success" content="With a custom icon." icon="zap" />
        <Message type="error" content={errorMessage} dismiss={() => setErrorMessage('')} />
        <Message>
          <H5>Custom Content</H5>
          <Text>Hello there! Here is more content.</Text>
        </Message>
      </DocSection>

      <DocSection title="Placeholder">
        <Flex stack>
          <Placeholder css={{ maxWidth: '30rem', height: '5rem' }} />
          <Placeholder css={{ maxWidth: '20rem', height: '2rem' }} />
          <Placeholder css={{ maxWidth: '10rem', height: '1.5rem' }} />
        </Flex>
      </DocSection>

      <DocSection title="Popover">
        <Flex wrap>
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button>Custom Trigger</Button>
            </Popover.Trigger>

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

          <Popover.Root>
            <Popover.Button>Standard</Popover.Button>

            <Popover.Content>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet
                in, tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus non.
              </Text>
            </Popover.Content>
          </Popover.Root>

          <Popover.Root>
            <Popover.Button size="s">Small</Popover.Button>

            <Popover.Content>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet
                in, tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus non.
              </Text>
            </Popover.Content>
          </Popover.Root>
        </Flex>
      </DocSection>

      <DocSection title="Progress">
        <Flex justify="center" stack>
          <Progress css={{ maxWidth: '30rem' }} value={progressValue} max={100} />
          <Text family="number">{progressValue + '%'}</Text>
        </Flex>

        <Flex>
          <Button color="neutral" onClick={() => setProgressValue(progressValue - 10)} disabled={progressValue <= 0}>
            Decrease
          </Button>

          <Button color="neutral" onClick={() => setProgressValue(progressValue + 10)} disabled={progressValue >= 100}>
            Increase
          </Button>
        </Flex>
      </DocSection>

      <DocSection title="Section" background="surface2">
        <Text>
          Each UI section is wrapped by a section component. This section is using the &quot;surface2&quot; color
          background.
        </Text>
      </DocSection>

      <DocSection title="Slider">
        <H4>Single</H4>

        <Slider.Root defaultValue={[25]} css={{ maxWidth: '30rem' }}>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb />
          <Slider.Thumb />
        </Slider.Root>

        <H4>Range</H4>

        <Slider.Root defaultValue={[25, 75]} css={{ maxWidth: '30rem' }}>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb />
          <Slider.Thumb />
        </Slider.Root>

        <H4>Vertical</H4>

        <Box css={{ height: '10rem' }}>
          <Slider.Root defaultValue={[25]} orientation="vertical">
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb />
            <Slider.Thumb />
          </Slider.Root>
        </Box>
      </DocSection>

      <DocSection title="Spinner">
        <Flex align="center">
          <Spinner size="xs" />
          <Spinner size="s" />
          <Spinner size="m" />
        </Flex>

        <HR />

        <H4>Center</H4>

        <Spinner size="m" center />
      </DocSection>

      <DocSection title="SVG Icon">
        <Text>
          Sometimes we need to pull in custom SVG icons. This component can be used to wrap an imported SVG and apply
          standard colors and sizes.
        </Text>

        <Flex>
          <SvgIcon size="xl" icon={ExampleIcon} />
          <SvgIcon size="l" icon={ExampleIcon} />
          <SvgIcon size="m" icon={ExampleIcon} />
          <SvgIcon size="s" icon={ExampleIcon} />
          <SvgIcon size="xs" icon={ExampleIcon} />
        </Flex>

        <Flex>
          <Box css={{ color: 'orange' }}>
            <SvgIcon icon={ExampleIcon} />
          </Box>
          <SvgIcon color="primary" icon={ExampleIcon} />
          <SvgIcon color="danger" icon={ExampleIcon} />
          <SvgIcon color="text1" icon={ExampleIcon} />
          <SvgIcon color="text2" icon={ExampleIcon} />
          <SvgIcon color="text3" icon={ExampleIcon} />
        </Flex>
      </DocSection>

      <DocSection title="Switch">
        <Switch aria-label="Turbo Mode" />

        <HR />

        <Flex as="label" align="center">
          <Switch />
          With a Label On Right
        </Flex>

        <Flex as="label" align="center">
          With a Label On Left
          <Switch />
        </Flex>

        <HR />

        <Flex as="label" align="center">
          <Switch>
            <FeatherIcon icon="sun" size="xs" />
          </Switch>
          With an Icon
        </Flex>

        <Flex as="label" align="center">
          <Switch>
            <FeatherIcon icon="sun" size="xs" data-on />
            <FeatherIcon icon="moon" size="xs" data-off />
          </Switch>
          With a Dynamic Icon
        </Flex>

        <HR />

        <Flex as="label" align="center">
          <Switch size="s">
            <FeatherIcon icon="sun" size="xs" data-on />
            <FeatherIcon icon="moon" size="xs" data-off />
          </Switch>
          Small Switch
        </Flex>
      </DocSection>

      <DocSection title="Table">
        <H4>Standard Table</H4>

        <Table.Root>
          <Table.Head css={{ top: 0 }}>
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

        <H4>Clickable Rows</H4>

        <Table.Root>
          <Table.Head css={{ top: 0 }}>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Favorite Color</Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {tableRows.map((row) => {
              return (
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
              );
            })}
          </Table.Body>
        </Table.Root>

        <H4>Clickable Cells</H4>

        <Table.Root>
          <Table.Head css={{ top: 0 }}>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Favorite Color</Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {tableRows.map((row) => {
              return (
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
                  <Table.Cell
                    clickable
                    onClick={() => {
                      alert('Table Cell Click 3');
                    }}
                  >
                    {row.favoriteColor}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>

        <H4>Clickable Rows + Some Clickable Cells</H4>

        <Table.Root>
          <Table.Head css={{ top: 0 }}>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Favorite Color</Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {tableRows.map((row) => {
              return (
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
              );
            })}
          </Table.Body>
        </Table.Root>

        <H4>With Custom Header</H4>

        <Table.Root
          header={
            <Flex align="center" stack={{ '@tablet': true }}>
              <FeatherIcon icon="sun" />
              <H5>My Cool Table</H5>
              <Text size="bodySmall" css={{ flexGrow: 10 }}>
                Anything could go in here.
              </Text>
              <Button size="s" color="primaryBorder">
                <FeatherIcon icon="sliders" />
                Filter
              </Button>
            </Flex>
          }
        >
          <Table.Head css={{ top: 0 }}>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Favorite Color</Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {tableRows.map((row) => {
              return (
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
              );
            })}
          </Table.Body>
        </Table.Root>
      </DocSection>

      <DocSection title="Tabs">
        <Tabs.Root defaultValue="tab-1">
          <Tabs.List>
            <Tabs.Trigger value="tab-1">Tab 1</Tabs.Trigger>
            <Tabs.Trigger value="tab-2">Tab 2</Tabs.Trigger>
            <Tabs.Trigger value="tab-3">Tab 3 With a Long Name</Tabs.Trigger>
            <Tabs.Trigger value="tab-4">
              <FeatherIcon icon="home" />
              Tab 4 With Icon
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="tab-1">
            <Flex stack>
              <H4>Tab 1</H4>
              <Text>Some tab 1 content.</Text>
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="tab-2">
            <Flex stack>
              <H4>Tab 2</H4>
              <Text>Some tab 2 content.</Text>
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="tab-3">
            <Flex stack>
              <H4>Tab 3</H4>
              <Text>Some tab 3 content.</Text>
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="tab-4">
            <Flex stack>
              <H4>Tab 4</H4>
              <Text>Some tab 4 content.</Text>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </DocSection>

      <DocSection title="Text">
        <Text>
          Renders a &quot;p&quot; element that can be set to a specific family, size, and/or color. Use the
          &quot;as&quot; property to change the underlying tag (eg: as=&quot;span&quot;).
        </Text>

        <HR />

        <Flex gap="l" wrap>
          <Text size="h1">Size H1</Text>
          <Text size="h2">Size H2</Text>
          <Text size="h3">Size H3</Text>
          <Text size="h4">Size H4</Text>
          <Text size="h5">Size H5</Text>
          <Text size="h6">Size H6</Text>
        </Flex>

        <HR />

        <Flex gap="l" wrap>
          <Text size="h3" family="action">
            Family Action
          </Text>
          <Text size="h3" family="body">
            Family Body
          </Text>
          <Text size="h3" family="code">
            Family Code
          </Text>
          <Text size="h3" family="heading">
            Family Heading
          </Text>
          <Text size="h3" family="number">
            Family Number
          </Text>
        </Flex>

        <HR />

        <Flex gap="l" wrap>
          <span style={{ color: 'orange' }}>
            <Text size="h3" color="current">
              Current
            </Text>
          </span>
          <Text size="h3" color="danger">
            Danger
          </Text>
          <Text size="h3" color="primary">
            Primary
          </Text>
          <Text size="h3" color="text1">
            Text 1
          </Text>
          <Text size="h3" color="text2">
            Text 2
          </Text>
          <Text size="h3" color="text3">
            Text 3
          </Text>
        </Flex>

        <HR />

        <Flex gap="l" wrap>
          <Text weight="regular">Regular Weight</Text>
          <Text weight="semibold">Semibold Weight</Text>
        </Flex>
      </DocSection>

      <DocSection title="Text Link">
        <Flex wrap>
          <Link href="/project-settings" passHref>
            <TextLink>Primary Link</TextLink>
          </Link>
          <Link href="/project-settings" passHref>
            <TextLink color="danger">Danger Link</TextLink>
          </Link>
          <Link href="/project-settings" passHref>
            <TextLink color="neutral">Neutral Link</TextLink>
          </Link>
          <Link href="/project-settings" passHref>
            <TextLink size="s" color="neutral">
              Small Link
            </TextLink>
          </Link>
        </Flex>

        <Flex wrap>
          <TextLink external>External Link</TextLink>
          <TextButton onClick={() => alert('Hi!')}>Button</TextButton>
        </Flex>
      </DocSection>

      <DocSection title="Text Overflow">
        <Text css={{ maxWidth: '18rem' }}>
          <TextOverflow>Sometimes you need to cut off text at a certain point.</TextOverflow>
        </Text>
      </DocSection>

      <DocSection title="Theme Utility Classes">
        <Section className="light-theme" noBorder>
          <H4>.light-theme</H4>
          <Text>This section will always be light.</Text>
        </Section>

        <Section className="dark-theme" noBorder>
          <H4>.dark-theme</H4>
          <Text>This section will always be dark.</Text>
        </Section>

        <Section className="reverse-theme" noBorder>
          <H4>.reverse-theme</H4>
          <Text>This section will always be reverse of the current theme.</Text>
        </Section>
      </DocSection>

      <DocSection title="Toast">
        <Flex wrap>
          <Button
            color="neutral"
            onClick={() =>
              openToast({
                title: 'Toast Title',
                description: 'This is a great toast description.',
              })
            }
          >
            Open a Toast
          </Button>

          <Button
            color="neutral"
            onClick={() =>
              openToast({
                title: 'Toast Title',
                description: 'This is a great toast description.',
                icon: 'zap',
                action: () => {
                  alert(1);
                },
                actionText: 'Do Action',
              })
            }
          >
            With an Action + Icon
          </Button>

          <Button
            color="neutral"
            onClick={() =>
              openToast({
                id: 'my-toast-123',
                title: 'Toast Title',
                description: 'This is a great toast description.',
              })
            }
          >
            Deduplicate
          </Button>

          <Button
            color="neutral"
            onClick={() =>
              openToast({
                description: 'This is a toast description',
              })
            }
          >
            No Title
          </Button>

          <Button
            color="neutral"
            onClick={() =>
              openToast({
                duration: 1000,
                description: 'This will close in 1 second',
              })
            }
          >
            Custom Duration
          </Button>

          <Button
            color="neutral"
            onClick={() =>
              openToast({
                duration: Infinity,
                description: 'This will never auto close',
              })
            }
          >
            No Auto Close
          </Button>

          <Button
            color="danger"
            onClick={() =>
              openToast({
                title: 'Toast Title',
                description: 'This is a toast description. It can be as long as you need.',
                type: 'error',
              })
            }
          >
            Error
          </Button>

          <Button
            onClick={() =>
              openToast({
                title: 'Toast Title',
                description: 'This is a toast description. It can be as long as you need.',
                type: 'success',
              })
            }
          >
            Success
          </Button>
        </Flex>
      </DocSection>

      <DocSection title="Tooltip">
        <Flex align="center" wrap>
          <Tooltip content="I am the tooltip message.">
            <Button>Curious Button</Button>
          </Tooltip>

          <Tooltip
            content={
              <>
                <FeatherIcon icon="cpu" /> I have an icon.
              </>
            }
          >
            <Text>With Icon</Text>
          </Tooltip>

          <Tooltip color="primary" content="Primary!">
            <Text>Primary</Text>
          </Tooltip>

          <Tooltip color="danger" content="Danger!">
            <Text>Danger</Text>
          </Tooltip>

          <Tooltip color="reverse" content="Reverse!">
            <Text>Reverse</Text>
          </Tooltip>

          <Tooltip content="Right side!" side="right">
            <Text>Side</Text>
          </Tooltip>
        </Flex>
      </DocSection>
    </>
  );
};

type DocSectionProps = Omit<ComponentProps<typeof Section>, 'title'> & {
  title: string;
};

function DocSection({ children, title, ...props }: DocSectionProps) {
  const id = title
    .toLowerCase()
    .replace(/\s/, '-')
    .replace(/[^\w-]/, '');

  return (
    <Section id={id} {...props}>
      <Flex stack gap="l">
        <H2
          as="a"
          href={`#${id}`}
          css={{
            '[data-icon]': {
              opacity: 0,
              transition: 'var(--transitions)',
            },
            '&:hover, &:focus': {
              '[data-icon]': {
                opacity: 1,
              },
            },
            '&:focus': {
              outline: 'var(--focus-outline)',
              outlineOffset: 'var(--focus-outline-offset)',
            },
          }}
        >
          <Flex as="span" align="center">
            {title}
            <FeatherIcon icon="link" data-icon />
          </Flex>
        </H2>
        {children}
      </Flex>
    </Section>
  );
}

function DocSectionCombobox() {
  const [comboboxOneItems, setComboboxOneItems] = useState([...books]);
  const [comboboxTwoItems, setComboboxTwoItems] = useState([...books]);
  const [comboboxThreeItems, setComboboxThreeItems] = useState([...books]);

  const comboxboxOne = useCombobox({
    id: 'combobox1',
    onInputValueChange({ inputValue }) {
      const query = inputValue?.toLowerCase().trim();
      const filtered = books.filter(
        (item) => !query || item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query),
      );
      setComboboxOneItems(filtered);
    },
    items: comboboxOneItems,
    itemToString(item) {
      return item ? item.title : '';
    },
  });

  const comboxboxTwo = useCombobox({
    id: 'combobox2',
    onInputValueChange({ inputValue }) {
      const query = inputValue?.toLowerCase().trim();
      const filtered = books.filter(
        (item) => !query || item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query),
      );
      setComboboxTwoItems(filtered);
    },
    items: comboboxTwoItems,
    itemToString(item) {
      return item ? item.title : '';
    },
  });

  const comboxboxThree = useCombobox({
    id: 'combobox3',
    onInputValueChange({ inputValue }) {
      const query = inputValue?.toLowerCase().trim();
      const filtered = books.filter(
        (item) => !query || item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query),
      );
      setComboboxThreeItems(filtered);
    },
    items: comboboxThreeItems,
    itemToString(item) {
      return item ? item.title : '';
    },
  });

  return (
    <DocSection title="Combobox">
      <H4>Toggle Open Button, Floating Input Label, Menu Label</H4>

      <Form.Group maxWidth="m">
        <Combobox.Root open={comboxboxOne.isOpen}>
          <Combobox.Box
            toggleButtonProps={{ ...comboxboxOne.getToggleButtonProps() }}
            {...comboxboxOne.getComboboxProps()}
          >
            <Form.FloatingLabelInput
              label="Favorite Book"
              labelProps={{ ...comboxboxOne.getLabelProps() }}
              {...comboxboxOne.getInputProps()}
            />
          </Combobox.Box>

          <Combobox.Menu {...comboxboxOne.getMenuProps()}>
            <Combobox.MenuLabel>
              <FeatherIcon icon="book" size="xs" /> Suggestions:
            </Combobox.MenuLabel>

            {comboboxOneItems.length === 0 && (
              <Combobox.MenuContent>
                No matching suggestions found.{' '}
                <Text color="primary" size="bodySmall" as="span">
                  &quot;{comboxboxOne.inputValue}&quot;
                </Text>{' '}
                will be added as a new book.
              </Combobox.MenuContent>
            )}

            {comboboxOneItems.map((item, index) => (
              <Combobox.MenuItem {...comboxboxOne.getItemProps({ item, index })} key={item.title}>
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
      </Form.Group>

      <H4>Outside Input Label</H4>

      <Form.Group maxWidth="m">
        <Form.Label {...comboxboxTwo.getLabelProps()}>Favorite Books</Form.Label>

        <Combobox.Root open={comboxboxTwo.isOpen}>
          <Combobox.Box {...comboxboxTwo.getComboboxProps()}>
            <Form.Input {...comboxboxTwo.getInputProps()} />
          </Combobox.Box>

          <Combobox.Menu {...comboxboxTwo.getMenuProps()}>
            {comboboxTwoItems.length === 0 && <Combobox.MenuContent>No existing books match.</Combobox.MenuContent>}

            {comboboxTwoItems.map((item, index) => (
              <Combobox.MenuItem {...comboxboxTwo.getItemProps({ item, index })} key={item.title}>
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
      </Form.Group>

      <H4>Hide Menu (No Results), Auto Open (Focus)</H4>

      <Form.Group maxWidth="m">
        <Form.Label {...comboxboxThree.getLabelProps()}>Favorite Books</Form.Label>

        <Combobox.Root open={comboxboxThree.isOpen && comboboxThreeItems.length > 0}>
          <Combobox.Box {...comboxboxThree.getComboboxProps()}>
            <Form.Input
              {...comboxboxThree.getInputProps({
                onFocus: () => !comboxboxThree.isOpen && comboxboxThree.openMenu(),
              })}
            />
          </Combobox.Box>

          <Combobox.Menu {...comboxboxThree.getMenuProps()}>
            {comboboxThreeItems.map((item, index) => (
              <Combobox.MenuItem {...comboxboxThree.getItemProps({ item, index })} key={item.title}>
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
      </Form.Group>
    </DocSection>
  );
}

interface FakeForm {
  age: number;
  displayName: string;
  email: string;
  favoriteBook: string;
  favoriteFood: string;
  favoriteColorsBlue: boolean;
  favoriteColorsOrange: boolean;
  favoriteWeather: string;
  favoriteIcon: string;
  termsAccepted: boolean;
}

function DocSectionForm() {
  const [comboboxItems, setComboboxItems] = useState([...books]);
  const form = useForm<FakeForm>();

  const comboxbox = useCombobox({
    id: 'comboboxForm1',
    items: comboboxItems,
    itemToString(item) {
      return item ? item.title : '';
    },
    onInputValueChange({ inputValue }) {
      const query = inputValue?.toLowerCase().trim();
      const filtered = books.filter(
        (item) => !query || item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query),
      );
      setComboboxItems(filtered);
    },
    onSelectedItemChange() {
      form.clearErrors('favoriteBook');
    },
  });

  return (
    <DocSection title="Form">
      <Form.Root
        onSubmit={form.handleSubmit((value) => {
          alert(JSON.stringify(value));
        })}
        css={{ maxWidth: 'var(--size-max-container-width-s)' }}
      >
        <Flex stack gap="l">
          <Form.Group>
            <Form.Label htmlFor="displayName">Display Name</Form.Label>
            <Form.Input
              id="displayName"
              placeholder="eg: John Smith"
              isInvalid={!!form.formState.errors.displayName}
              {...form.register('displayName', formValidations.displayName)}
            />
            <Form.Feedback>{form.formState.errors.displayName?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Flex gap="s" align="center">
              <Form.Label htmlFor="email">Email</Form.Label>
              <Info content="This would provide even more context." />
            </Flex>

            <Text>This could provide a description for a confusing field.</Text>

            <Form.Input
              id="email"
              type="email"
              isInvalid={!!form.formState.errors.email}
              {...form.register('email', formValidations.email)}
            />
            <Form.Feedback>{form.formState.errors.email?.message}</Form.Feedback>
          </Form.Group>

          <HR />

          <H4>Floating Labels & Select Dropdowns</H4>

          <Form.Group>
            <Form.FloatingLabelInput
              type="number"
              label="Age - Floating Label"
              isInvalid={!!form.formState.errors.age}
              {...form.register('age', {
                valueAsNumber: true,
                required: 'Please enter your age',
                min: {
                  value: 12,
                  message: 'Must be at least 12 years old',
                },
              })}
            />
            <Form.Feedback>{form.formState.errors.age?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.FloatingLabelInput type="number" label="Age - Floating Label + Placeholder" placeholder="eg: 35" />
          </Form.Group>

          <Controller
            name="favoriteWeather"
            control={form.control}
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
                        isInvalid={!!form.formState.errors.favoriteWeather}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        selection={
                          favoriteWeather && (
                            <>
                              <FeatherIcon icon={favoriteWeather.icon} color="primary" />
                              {favoriteWeather.display}
                            </>
                          )
                        }
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

                  <Form.Feedback>{form.formState.errors.favoriteWeather?.message}</Form.Feedback>
                </Form.Group>
              );
            }}
          />

          <HR />

          <H4>Combobox</H4>

          <Form.Group>
            <Combobox.Root open={comboxbox.isOpen}>
              <Combobox.Box
                toggleButtonProps={{ ...comboxbox.getToggleButtonProps() }}
                {...comboxbox.getComboboxProps()}
              >
                <Form.FloatingLabelInput
                  label="Favorite Book"
                  labelProps={{ ...comboxbox.getLabelProps() }}
                  isInvalid={!!form.formState.errors.favoriteBook}
                  {...mergeInputProps(
                    comboxbox.getInputProps(),
                    form.register('favoriteBook', {
                      required: 'Please enter a favorite book',
                    }),
                  )}
                />
              </Combobox.Box>

              <Combobox.Menu {...comboxbox.getMenuProps()}>
                <Combobox.MenuLabel>
                  <FeatherIcon icon="book" size="xs" /> Suggestions:
                </Combobox.MenuLabel>

                {comboboxItems.length === 0 && (
                  <Combobox.MenuContent>
                    No matching suggestions found.{' '}
                    <Text color="primary" size="bodySmall" as="span">
                      &quot;{comboxbox.inputValue}&quot;
                    </Text>{' '}
                    will be added as a new book.
                  </Combobox.MenuContent>
                )}

                {comboboxItems.map((item, index) => (
                  <Combobox.MenuItem {...comboxbox.getItemProps({ item, index })} key={item.title}>
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

            <Form.Feedback>{form.formState.errors.favoriteBook?.message}</Form.Feedback>
          </Form.Group>

          <HR />

          <Form.Group>
            <Form.Label>Disabled</Form.Label>
            <Form.Input disabled />
          </Form.Group>

          <HR />

          <Form.Group gap="m">
            <Form.Label>Favorite Food</Form.Label>

            <CheckboxGroup aria-label="Pick your favorite food">
              {favoriteFoodOptions.map((option) => (
                <Checkbox
                  radio
                  key={option.value}
                  value={option.value}
                  isInvalid={!!form.formState.errors.favoriteFood}
                  {...form.register('favoriteFood', {
                    required: 'You must select a favorite food',
                  })}
                >
                  {option.display}
                  <Text size="bodySmall">{option.description}</Text>
                </Checkbox>
              ))}
            </CheckboxGroup>

            <Form.Feedback>{form.formState.errors.favoriteFood?.message}</Form.Feedback>
          </Form.Group>

          <Form.Group gap="m">
            <Form.Label>Favorite Colors</Form.Label>

            <CheckboxGroup aria-label="Pick a favorite color">
              <Checkbox {...form.register('favoriteColorsOrange')}>Orange</Checkbox>
              <Checkbox {...form.register('favoriteColorsBlue')}>Blue</Checkbox>
            </CheckboxGroup>
          </Form.Group>

          <HR />

          <Form.Group gap="m">
            <Form.Label>Favorite Icon</Form.Label>

            <CheckboxCard.Group aria-label="Select your favorite icon">
              {favoriteIconOptions.map((option) => (
                <CheckboxCard.Card
                  radio
                  key={option.id}
                  disabled={option.disabled}
                  value={option.id}
                  isInvalid={!!form.formState.errors.favoriteIcon}
                  css={{ width: '7rem', height: '7rem' }}
                  {...form.register('favoriteIcon', {
                    required: 'You must select a favorite icon',
                  })}
                >
                  <FeatherIcon icon={option.icon} />
                  <CheckboxCard.Title>{option.title}</CheckboxCard.Title>
                </CheckboxCard.Card>
              ))}
            </CheckboxCard.Group>

            <Form.Feedback>{form.formState.errors.favoriteIcon?.message}</Form.Feedback>
          </Form.Group>

          <HR />

          <Form.Group>
            <Checkbox
              isInvalid={!!form.formState.errors.termsAccepted}
              {...form.register('termsAccepted', {
                required: 'You must accept the terms.',
              })}
            >
              I agree to the{' '}
              <TextLink href="/" target="_blank">
                Terms & Conditions
              </TextLink>
            </Checkbox>

            <Form.Feedback>{form.formState.errors.termsAccepted?.message}</Form.Feedback>
          </Form.Group>

          <Button type="submit">Submit</Button>
        </Flex>
      </Form.Root>

      <HR />

      <H4>Horizontal</H4>

      <Form.Root>
        <Form.HorizontalGroup>
          <Form.Label>Horizontal</Form.Label>
          <Form.Group>
            <Form.Input />
          </Form.Group>

          <Form.Label>Horizontal Field Two</Form.Label>
          <Form.Group maxWidth="m">
            <Form.Input />
            <Form.Feedback type="neutral">Here is some feedback.</Form.Feedback>
          </Form.Group>

          <Form.Label>Horizontal Field With a Really Long Label</Form.Label>
          <Form.Group maxWidth="s">
            <Form.Input />
          </Form.Group>
        </Form.HorizontalGroup>
      </Form.Root>

      <HR />

      <H4>Max Width</H4>

      <Form.Root>
        <Flex stack>
          <Form.Group maxWidth="xxs">
            <Form.Label>XXS</Form.Label>
            <Form.Input />
          </Form.Group>

          <Form.Group maxWidth="xs">
            <Form.Label>XS</Form.Label>
            <Form.Input />
          </Form.Group>

          <Form.Group maxWidth="s">
            <Form.Label>S</Form.Label>
            <Form.Input />
          </Form.Group>

          <Form.Group maxWidth="m">
            <Form.Label>M</Form.Label>
            <Form.Input />
          </Form.Group>

          <Form.Group maxWidth="l">
            <Form.Label>L</Form.Label>
            <Form.Input />
          </Form.Group>
        </Flex>
      </Form.Root>
    </DocSection>
  );
}

export default Settings;
