import type { ComponentProps } from 'react';

import LogoIconSvg from '@/public/images/brand/pagoda-icon.svg';
import LogoSvg from '@/public/images/brand/pagoda-logo.svg';

import * as S from './styles';

type Props = ComponentProps<typeof S.Logo> & {
  collapsed?: boolean;
};

export function Logo({ collapsed, ...props }: Props) {
  return (
    <S.Logo {...props}>
      {!collapsed && <LogoSvg style={{ height: '1.75rem', overflow: 'visible' }} />}
      {collapsed && <LogoIconSvg style={{ height: '1.75rem', overflow: 'visible' }}></LogoIconSvg>}
    </S.Logo>
  );
}
