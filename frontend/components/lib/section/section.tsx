import type { ComponentProps, ElementType } from 'react';

import { Container } from '../container';
import { Stack } from '../stack';
import * as S from './styles';

type Props = ComponentProps<typeof S.Section> & {
  as?: ElementType;
};

export const Section = (props: Props) => {
  return (
    <S.Section {...props}>
      <Container>
        <Stack>{props.children}</Stack>
      </Container>
    </S.Section>
  );
};
