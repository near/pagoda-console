import type { ComponentProps } from 'react';

import IconSheet from './feather-icons-4.29.0.svg';
import * as S from './styles';

type Props = ComponentProps<typeof S.Svg> & {
  icon: string;
  strokeWidth?: number;
};

export const FeatherIconSheet = () => {
  return <IconSheet style={{ display: 'none' }} />;
};

export const FeatherIcon = ({ icon, strokeWidth = 2, ...props }: Props) => {
  const href = `#feather-icons-4_29_0_svg__${icon}`;

  return (
    <S.Svg
      width="50"
      height="50"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <use href={href} />
    </S.Svg>
  );
};
