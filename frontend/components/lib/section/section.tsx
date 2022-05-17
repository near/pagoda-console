import type { ComponentProps, ElementType } from 'react';

import { Container } from '../container';
import { Flex } from '../flex';
import * as S from './styles';

type Props = ComponentProps<typeof S.Section> & {
  as?: ElementType;
};

export const Section = (props: Props) => {
  return (
    <S.Section {...props}>
      <Container>
        <Flex stack>{props.children}</Flex>
      </Container>
    </S.Section>
  );
};
