import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { ComponentProps } from 'react';

import * as S from './styles';

type Props = ComponentProps<typeof S.Spinner>;

export function Spinner(props: Props) {
  return (
    <S.Spinner role="status" {...props}>
      <VisuallyHidden>Loading...</VisuallyHidden>
    </S.Spinner>
  );
}
