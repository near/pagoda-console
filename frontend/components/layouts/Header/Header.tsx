import type { ComponentProps } from '@stitches/react';

import { Flex } from '@/components/lib/Flex';
import { P } from '@/components/lib/Paragraph';

import * as S from './styles';

type Props = ComponentProps<typeof S.Header>;

export function Header(props: Props) {
  return (
    <S.Header {...props}>
      <Flex>
        <P>Header</P>
      </Flex>
    </S.Header>
  );
}
