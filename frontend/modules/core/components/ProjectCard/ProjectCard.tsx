import type { ComponentProps } from 'react';

import { Badge } from '@/components/lib/Badge';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H3 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';

import * as S from './styles';

type Props = ComponentProps<typeof S.Card> & {
  isComingSoon?: boolean;
  readonly?: boolean;
  icon?: string;
  title: string;
  description: string;
};

export function ProjectCard({ isComingSoon, title, description, icon, readonly, ...props }: Props) {
  const isButton = !readonly && !isComingSoon;

  return (
    <S.Card
      disabled={isComingSoon}
      {...props}
      role={isButton ? 'button' : undefined}
      tabIndex={isButton ? 0 : undefined}
    >
      <S.CardTop>{isComingSoon && <Badge>Coming Soon</Badge>}</S.CardTop>

      <S.CardBottom>
        <Flex justify="spaceBetween" align="center">
          <H3>{title}</H3>
          {isButton && <FeatherIcon icon={icon || 'chevrons-right'} size="m" color="primary" />}
        </Flex>

        <Text>{description}</Text>
      </S.CardBottom>
    </S.Card>
  );
}
