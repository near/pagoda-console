import type { ComponentProps, ElementType } from 'react';

import * as S from './styles';

type Props = ComponentProps<typeof S.Button> & {
  as?: ElementType;
};

export const Button = ({ children, type = 'button', ...props }: Props) => {
  return (
    <S.Button type={type} {...props}>
      <span>{children}</span>
    </S.Button>
  );
};
