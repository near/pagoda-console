import type { ComponentProps, SVGProps } from 'react';

import * as S from './styles';

type Props = ComponentProps<typeof S.Root> & {
  icon: (props: SVGProps<SVGElement>) => JSX.Element;
};

export const SvgIcon = ({ icon: Svg, ...props }: Props) => {
  return (
    <S.Root {...props}>
      <Svg width={undefined} height={undefined} />
    </S.Root>
  );
};
