import type { ComponentProps, ElementType } from 'react';

import { Container } from '../Container';
import * as S from './styles';

type Props = ComponentProps<typeof S.Section> & {
  as?: ElementType;
};

export const Section = (props: Props) => {
  return (
    <S.Section {...props}>
      <Container>{props.children}</Container>
    </S.Section>
  );
};
