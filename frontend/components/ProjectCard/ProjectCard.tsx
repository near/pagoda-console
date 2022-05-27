import type { ComponentProps } from 'react';

import { Badge } from '../lib/Badge';
import { FeatherIcon } from '../lib/FeatherIcon';
import { Flex } from '../lib/Flex';
import { H3 } from '../lib/Heading';
import { P } from '../lib/Paragraph';
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

        <P>{description}</P>
      </S.CardBottom>
    </S.Card>
  );
}
