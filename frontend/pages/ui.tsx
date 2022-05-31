import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import * as Accordion from '@/components/lib/Accordion';
import { Badge } from '@/components/lib/Badge';
import { Box } from '@/components/lib/Box';
import { Button, ButtonDropdown, ButtonLink } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import * as Dialog from '@/components/lib/Dialog';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Font } from '@/components/lib/Font';
import * as Form from '@/components/lib/Form';
import { H1, H2, H3, H4, H5, H6 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Info } from '@/components/lib/Info';
import { List, ListItem } from '@/components/lib/List';
import { Message } from '@/components/lib/Message';
import { P } from '@/components/lib/Paragraph';
import { Placeholder } from '@/components/lib/Placeholder';
import * as Popover from '@/components/lib/Popover';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { SvgIcon } from '@/components/lib/SvgIcon';
import * as Tabs from '@/components/lib/Tabs';
import { TextLink } from '@/components/lib/TextLink';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import ExampleIcon from '@/public/images/icons/ui-example.svg';
import { styled } from '@/styles/stitches';
import config from '@/utils/config';
import { formValidations } from '@/utils/constants';
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
    expand: {
      true: {
        width: '100%',
      },
    },
  },
});

interface FakeForm {
  displayName: string;
  email: string;
  favoriteFood: string;
  favoriteColorsBlue: boolean;
  favoriteColorsOrange: boolean;
  termsAccepted: boolean;
}

const Lipsum = () => {
  return (
    <>
      <P>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet in,
        tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus non. Integer
        dignissim, orci eget egestas mattis, eros lacus auctor diam, id elementum ipsum nulla ac dolor. Pellentesque
        placerat lectus eget turpis rutrum, vitae placerat ex eleifend. Cras vitae tellus ultricies nisl congue
        molestie. Quisque id varius nisi, quis pretium metus.
      </P>
      <P>
        Donec fringilla massa in diam ultrices pretium. Suspendisse ut quam in erat tincidunt mollis. Maecenas pulvinar,
        arcu eu sodales imperdiet, mauris orci pellentesque quam, quis fermentum sapien risus nec nulla.
      </P>
      <P>
        Vestibulum vel viverra sem. Suspendisse nec nisi turpis. Curabitur tristique magna sed turpis ullamcorper
        commodo. Nunc mattis mi sed ex pretium, et iaculis odio facilisis. Maecenas tempor nulla magna, quis dignissim
        magna convallis blandit. Sed convallis sapien risus, at tincidunt justo blandit vitae. Aliquam erat volutpat.
        Duis blandit metus mauris, vitae lacinia nibh lobortis eu.
      </P>
      <P>
        Donec et sagittis ligula. Morbi et consequat nibh, nec cursus mauris. Sed dapibus lectus nec felis porta dictum.
        Duis ac blandit justo, sed facilisis ante. Fusce eleifend turpis leo, a ultricies quam mattis ac. Mauris
        sagittis, urna et malesuada facilisis, augue elit suscipit nunc, ut accumsan mi urna a eros. Maecenas blandit
        hendrerit malesuada.
      </P>
      <P>
        Quisque risus velit, consectetur in commodo in, ultrices ut est. Suspendisse est diam, commodo non luctus nec,
        pellentesque et ex. Etiam at velit porta, malesuada odio ut, lobortis libero. Quisque pretium, quam sit amet
        suscipit tempor, enim quam volutpat lacus, in pharetra nunc magna quis dui. Praesent elementum pulvinar
        consectetur.
      </P>
      <P>
        Nunc non bibendum erat, vel eleifend sapien. Etiam nec auctor ligula, ut scelerisque risus. Integer ac eros nec
        eros eleifend rutrum sit amet at sapien. In lacinia sem ac neque rhoncus, quis finibus sapien ultricies. Sed
        varius non orci a consectetur. Duis ut blandit justo, tincidunt vulputate neque. Ut placerat turpis in eleifend
        dignissim.
      </P>
    </>
  );
};

const Settings: NextPageWithLayout = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [bookmarksChecked, setBookmarksChecked] = useState(true);
  const [urlsChecked, setUrlsChecked] = useState(false);
  const [person, setPerson] = useState('pedro');
  const [errorMessage, setErrorMessage] = useState('This is a dismissable error message');
  const { register, handleSubmit, formState } = useForm<FakeForm>();
  const router = useRouter();

  useEffect(() => {
    // Don't allow users to visit /ui in production
    if (config.deployEnv === 'PRODUCTION') {
      router.replace('/');
    }
  }, [router]);

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

  return (
    <>
      <Section color="surface2">
        <Flex align="center" justify="spaceBetween" wrap>
          <Flex stack css={{ width: 'auto' }}>
            <H1>Stitches & Radix UI</H1>
            <P>This page shows examples of all our shared components.</P>
          </Flex>

          <ThemeToggle css={{ width: 'auto' }} />
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Accordion</H2>

          <Accordion.Root type="multiple">
            <Accordion.Item value="item-1">
              <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
              <Accordion.Content>
                <Flex stack>
                  <P>Yes. It adheres to the WAI-ARIA design pattern.</P>
                  <P>Here is another paragraph.</P>

                  <div>
                    <Button>Click Me</Button>
                  </div>
                </Flex>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-2">
              <Accordion.Trigger>Is it unstyled?</Accordion.Trigger>
              <Accordion.Content>
                <Flex stack>
                  <P>Yes. It is unstyled by default, giving you freedom over the look and feel.</P>
                </Flex>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="item-3">
              <Accordion.Trigger>
                <FeatherIcon icon="eye" />
                Some Title
                <P>With a subtitle</P>
              </Accordion.Trigger>
              <Accordion.Content>
                <Flex stack>
                  <P>Yes! You can animate the Accordion with CSS or JavaScript.</P>
                </Flex>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </Flex>
      </Section>

      <Section>
        <Flex align="center">
          <H2
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-s)',
              flexWrap: 'wrap',
            }}
          >
            Badge
            <Badge>Neutral</Badge>
            <Badge color="primary">Primary</Badge>
            <Badge color="danger">Danger</Badge>
            <Badge size="small">Small</Badge>
          </H2>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Box</H2>

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
            <P>A box is an unstyled div that you can apply your own styles to via the css prop.</P>
          </Box>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Button</H2>

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
            <Button color="neutral">Neutral</Button>
            <Button color="transparent">Transparent</Button>
            <Button color="neutral" size="small">
              Small
            </Button>
            <Button color="neutral" size="small" loading>
              Small
            </Button>
          </Flex>

          <Flex wrap>
            <ButtonDropdown>Dropdown</ButtonDropdown>

            <Link href="/project-settings" passHref>
              <ButtonLink color="neutral" size="small" css={{ '@mobile': { background: 'red' } }}>
                Link
              </ButtonLink>
            </Link>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Container</H2>

          <Container size="xxs">
            <Block expand>
              <P>xxs</P>
            </Block>
          </Container>

          <Container size="xs">
            <Block expand>
              <P>xs</P>
            </Block>
          </Container>

          <Container size="s">
            <Block expand>
              <P>s</P>
            </Block>
          </Container>

          <Container size="m">
            <Block expand>
              <P>m</P>
            </Block>
          </Container>

          <Container size="l">
            <Block expand>
              <P>l</P>
            </Block>
          </Container>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Dialog</H2>

          <P>Open/close via trigger:</P>

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button>Trigger</Button>
            </Dialog.Trigger>

            <Dialog.Content title="Your Modal Title" size="small">
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
              <Flex stack>
                <H1>Controlled</H1>
                <P>
                  This is a controlled dialog. You can ommit the title prop to avoid rendering the default title and
                  close button - this would allow you to render your own.
                </P>
                <Dialog.Close asChild>
                  <Button>Close Me</Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Dropdown Menu</H2>

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
              <DropdownMenu.Button size="small">Small</DropdownMenu.Button>
              <DropdownMenu.Content>
                <DropdownMenu.Item>New Tab</DropdownMenu.Item>
                <DropdownMenu.Item disabled>New Window</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Feather Icon</H2>
          <P>
            View all Feather Icons{' '}
            <TextLink href="https://feathericons.com/" target="_blank">
              here
            </TextLink>
            .
          </P>

          <Flex>
            <FeatherIcon icon="home" size="xl" />
            <FeatherIcon icon="home" size="l" />
            <FeatherIcon icon="home" size="m" />
            <FeatherIcon icon="home" size="s" />
            <FeatherIcon icon="home" size="xs" />
          </Flex>

          <Flex>
            <Font css={{ color: 'orange' }}>
              <FeatherIcon icon="cpu" />
            </Font>
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
        </Flex>
      </Section>

      <Section>
        <Flex stack gap="l">
          <H2>Flex</H2>

          <Flex stack>
            <P>Default</P>

            <Flex>
              <Block />
              <Block />
              <Block />
            </Flex>
          </Flex>

          <HR />

          <Flex stack>
            <P>Custom Gap & Justify</P>

            <Flex gap="xl" justify="end">
              <Block />
              <Block />
              <Block />
            </Flex>
          </Flex>

          <HR />

          <Flex stack>
            <P>Stack</P>

            <Flex stack>
              <Block />
              <Block />
              <Block />
            </Flex>
          </Flex>

          <Flex stack>
            <P>Breakpoint Stack</P>

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
            <P>Wrap</P>

            <Flex wrap>
              <Block />
              <Block />
              <Block />
              <Block />
              <Block />
              <Block />
            </Flex>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Font</H2>

          <P>Renders a span element that can be set to a specific family, size, and/or color.</P>

          <HR />

          <Flex as="p" gap="l" wrap>
            <Font size="h1">Size H1</Font>
            <Font size="h2">Size H2</Font>
            <Font size="h3">Size H3</Font>
            <Font size="h4">Size H4</Font>
            <Font size="h5">Size H5</Font>
            <Font size="h6">Size H6</Font>
          </Flex>

          <HR />

          <Flex as="p" gap="l" wrap>
            <Font size="h3" family="accent">
              Family Accent
            </Font>
            <Font size="h3" family="body">
              Family Body
            </Font>
            <Font size="h3" family="code">
              Family Code
            </Font>
            <Font size="h3" family="number">
              Family Number
            </Font>
          </Flex>

          <HR />

          <Flex as="p" gap="l" wrap>
            <Font size="h3" color="danger">
              Danger
            </Font>

            <Font size="h3" color="primary">
              Primary
            </Font>

            <Font size="h3" color="text1">
              Text 1
            </Font>

            <Font size="h3" color="text2">
              Text 2
            </Font>
            <Font size="h3" color="text3">
              Text 3
            </Font>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex stack gap="l">
          <H2>Form</H2>

          <Form.Root
            onSubmit={handleSubmit((value) => {
              alert(JSON.stringify(value));
            })}
            css={{ maxWidth: 'var(--size-max-container-width-xs)' }}
          >
            <Flex stack gap="l">
              <Form.Group>
                <Form.Label htmlFor="displayName">Display Name</Form.Label>
                <Form.Input
                  id="displayName"
                  placeholder="eg: John Smith"
                  isInvalid={!!formState.errors.displayName}
                  {...register('displayName', formValidations.displayName)}
                />
                <Form.Feedback>{formState.errors.displayName?.message}</Form.Feedback>
              </Form.Group>

              <Form.Group>
                <Flex gap="s" align="center">
                  <Form.Label htmlFor="email">Email</Form.Label>
                  <Info content="This would provide even more context." />
                </Flex>

                <P>This could provide a description for a confusing field.</P>

                <Form.Input
                  id="email"
                  type="email"
                  isInvalid={!!formState.errors.email}
                  {...register('email', formValidations.email)}
                />
                <Form.Feedback>{formState.errors.email?.message}</Form.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label>Disabled</Form.Label>
                <Form.Input disabled />
              </Form.Group>

              <Form.Fieldset>
                <Form.Group gap="m">
                  <Form.Legend>Favorite Food</Form.Legend>

                  <Form.CheckboxGroup>
                    {favoriteFoodOptions.map((option) => (
                      <Form.Checkbox
                        radio
                        key={option.value}
                        value={option.value}
                        isInvalid={!!formState.errors.favoriteFood}
                        {...register('favoriteFood', {
                          required: 'You must select a favorite food.',
                        })}
                      >
                        {option.display}
                        <P size="small">{option.description}</P>
                      </Form.Checkbox>
                    ))}
                  </Form.CheckboxGroup>

                  <Form.Feedback>{formState.errors.favoriteFood?.message}</Form.Feedback>
                </Form.Group>
              </Form.Fieldset>

              <Form.Fieldset>
                <Form.Group gap="m">
                  <Form.Legend>Favorite Colors</Form.Legend>

                  <Form.CheckboxGroup>
                    <Form.Checkbox {...register('favoriteColorsOrange')}>Orange</Form.Checkbox>
                    <Form.Checkbox {...register('favoriteColorsBlue')}>Blue</Form.Checkbox>
                  </Form.CheckboxGroup>
                </Form.Group>
              </Form.Fieldset>

              <HR />

              <Form.Group>
                <Form.Checkbox
                  isInvalid={!!formState.errors.termsAccepted}
                  {...register('termsAccepted', {
                    required: 'You must accept the terms.',
                  })}
                >
                  I agree to the{' '}
                  <TextLink href="/" target="_blank">
                    Terms & Conditions
                  </TextLink>
                </Form.Checkbox>

                <Form.Feedback>{formState.errors.termsAccepted?.message}</Form.Feedback>
              </Form.Group>

              <Button type="submit">Submit</Button>
            </Flex>
          </Form.Root>

          <HR />

          <Form.Root>
            <Flex stack>
              <Form.Group horizontal>
                <Form.Label>Horizontal</Form.Label>

                <Form.Group>
                  <Form.Input />
                  <Form.Feedback type="neutral">Here is some feedback.</Form.Feedback>
                </Form.Group>
              </Form.Group>

              <Form.Group horizontal>
                <Form.Label>Horizontal M</Form.Label>

                <Form.Group maxWidth="m">
                  <Form.Input />
                  <Form.Feedback type="neutral">Here is some feedback.</Form.Feedback>
                </Form.Group>
              </Form.Group>

              <Form.Group maxWidth="xs">
                <Form.Label>Max Width XS</Form.Label>
                <Form.Input />
              </Form.Group>

              <Form.Group maxWidth="s">
                <Form.Label>Max Width S</Form.Label>
                <Form.Input />
              </Form.Group>

              <Form.Group maxWidth="m">
                <Form.Label>Max Width M</Form.Label>
                <Form.Input />
              </Form.Group>

              <Form.Group maxWidth="l">
                <Form.Label>Max Width L</Form.Label>
                <Form.Input />
              </Form.Group>

              <Form.Group maxWidth="xl">
                <Form.Label>Max Width XL</Form.Label>
                <Form.Input />
              </Form.Group>
            </Flex>
          </Form.Root>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Heading</H2>

          <H1>Heading 1</H1>
          <H2>Heading 2</H2>
          <H3>Heading 3</H3>
          <H4>Heading 4</H4>
          <H5>Heading 5</H5>
          <H6>Heading 6</H6>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Horizontal Rule</H2>

          <P>Here is some content split with a horizontal rule.</P>

          <HR />

          <P>Here is more content.</P>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>List</H2>

          <H5>Unordered</H5>

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
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Message</H2>

          <Message content="Here is an info message." />
          <Message type="error" content="Here is an error message." />
          <Message type="success" content="Here is a success message." />
          <Message type="success" content="With a custom icon." icon="zap" />
          <Message type="error" content={errorMessage} dismiss={() => setErrorMessage('')} />
          <Message>
            <H5>Custom Content</H5>
            <P>Hello there! Here is more content.</P>
          </Message>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Paragraph</H2>
          <P size="small">A small paragraph.</P>
          <P>A standard paragraph.</P>
          <P size="large">A large paragraph.</P>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Placeholder</H2>

          <Placeholder css={{ width: '30rem', height: '5rem' }} />
          <Placeholder css={{ width: '20rem', height: '2rem' }} />
          <Placeholder css={{ width: '10rem', height: '1.5rem' }} />
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Popover</H2>

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

                  <P>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget
                    imperdiet in, tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula
                    tortor luctus non.
                  </P>

                  <Popover.Close asChild>
                    <Button
                      size="small"
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
                <P>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet
                  in, tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus
                  non.
                </P>
              </Popover.Content>
            </Popover.Root>

            <Popover.Root>
              <Popover.Button size="small">Small</Popover.Button>

              <Popover.Content>
                <P>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus turpis, auctor eget imperdiet
                  in, tincidunt ac sem. Aliquam erat volutpat. Integer eleifend metus orci, ac vehicula tortor luctus
                  non.
                </P>
              </Popover.Content>
            </Popover.Root>
          </Flex>
        </Flex>
      </Section>

      <Section color="surface2">
        <Flex stack>
          <H2>Section</H2>

          <P>
            Each UI section is wrapped by a section component. This section is using the &quot;surface2&quot; color
            background.
          </P>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Spinner</H2>

          <Flex align="center">
            <Spinner size="xs" />
            <Spinner size="s" />
            <Spinner size="m" />
          </Flex>

          <HR />

          <H4>Center</H4>

          <Spinner size="m" center />
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>SVG Icon</H2>

          <P>
            Sometimes we need to pull in custom SVG icons. This component can be used to wrap an imported SVG and apply
            standard colors and sizes.
          </P>

          <Flex>
            <SvgIcon size="xl" icon={ExampleIcon} />
            <SvgIcon size="l" icon={ExampleIcon} />
            <SvgIcon size="m" icon={ExampleIcon} />
            <SvgIcon size="s" icon={ExampleIcon} />
            <SvgIcon size="xs" icon={ExampleIcon} />
          </Flex>

          <Flex>
            <Font css={{ color: 'orange' }}>
              <SvgIcon icon={ExampleIcon} />
            </Font>
            <SvgIcon color="primary" icon={ExampleIcon} />
            <SvgIcon color="danger" icon={ExampleIcon} />
            <SvgIcon color="text1" icon={ExampleIcon} />
            <SvgIcon color="text2" icon={ExampleIcon} />
            <SvgIcon color="text3" icon={ExampleIcon} />
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Tabs</H2>

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
                <P>Some tab 1 content.</P>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="tab-2">
              <Flex stack>
                <H4>Tab 2</H4>
                <P>Some tab 2 content.</P>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="tab-3">
              <Flex stack>
                <H4>Tab 3</H4>
                <P>Some tab 3 content.</P>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="tab-4">
              <Flex stack>
                <H4>Tab 4</H4>
                <P>Some tab 4 content.</P>
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Text Link</H2>
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
              <TextLink size="small">Small Link</TextLink>
            </Link>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Text Overflow</H2>

          <P css={{ maxWidth: '18rem' }}>
            <TextOverflow>Sometimes you need to cut off text at a certain point.</TextOverflow>
          </P>
        </Flex>
      </Section>

      <Section>
        <Flex stack>
          <H2>Tooltip</H2>

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
              <P>With Icon</P>
            </Tooltip>

            <Tooltip color="primary" content="Primary!">
              <P>Primary</P>
            </Tooltip>

            <Tooltip color="danger" content="Danger!">
              <P>Danger</P>
            </Tooltip>

            <Tooltip color="reverse" content="Reverse!">
              <P>Reverse</P>
            </Tooltip>

            <Tooltip content="Right side!" side="right">
              <P>Side</P>
            </Tooltip>
          </Flex>
        </Flex>
      </Section>
    </>
  );
};

export default Settings;
