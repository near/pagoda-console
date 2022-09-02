import type { ComponentProps } from 'react';

import { Flex } from '@/components/lib/Flex';
import { H4, H6 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { styled } from '@/styles/stitches';

import { Card } from '../lib/Card';

const Container = styled('button', {
  display: 'flex',
  alignItems: 'center',
  width: '100%',

  '&:hover, &:focus': {
    cursor: 'pointer',
    'h4,h5': {
      textDecoration: 'underline',
    },
    img: {
      transform: 'scale(1.05)',
    },
  },

  '&:disabled': {
    opacity: '0.2',
    cursor: 'not-allowed',
  },
});

const Image = styled('img', {
  aspectRatio: '16 / 10',
  height: '104px',
  borderRadius: 'var(--border-radius-xs)',
  marginRight: 'var(--space-l)',
  transition: 'transform 0.10s ease-in-out',
});

type Props = ComponentProps<typeof Container> & {
  image: string;
  title: string;
  summary: string;
  noThumbnail?: boolean;
};

export function ContractTemplateListItem({ image, title, summary, noThumbnail, ...props }: Props) {
  if (noThumbnail) {
    return (
      <Card clickable as="button" padding="m" borderRadius="m" {...props}>
        <Flex stack gap="s">
          <H6>{title}</H6>
          <Text size="bodySmall">{summary}</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Container {...props}>
      <Image src={image} alt={title} />
      <Flex stack>
        <H4>{title}</H4>
        <Text>{summary}</Text>
      </Flex>
    </Container>
  );
}
