import type { ComponentProps } from 'react';

import { Container } from '../Container';
import * as S from './styles';

type Props = ComponentProps<typeof S.Section>;

export const Section = ({ children, ...props }: Props) => {
  return (
    <S.Section {...props}>
      <Container>{children}</Container>
    </S.Section>
  );
};
