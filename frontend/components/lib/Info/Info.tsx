import type { ComponentProps } from 'react';
import { useState } from 'react';

import { FeatherIcon } from '../FeatherIcon';
import { Tooltip } from '../Tooltip';
import * as S from './styles';

type Props = Omit<ComponentProps<typeof S.Info>, 'children'> & {
  content: string;
  size?: 'xs' | 's' | 'm' | 'l';
};

export const Info = ({ content, size }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  function onClick() {
    if (!isOpen) {
      setIsOpen(true);
    }
  }

  return (
    <Tooltip
      content={content}
      root={{
        delayDuration: 0,
        open: isOpen,
        onOpenChange: setIsOpen,
      }}
    >
      <S.Info>
        <FeatherIcon
          icon="help-circle"
          aria-label={isOpen ? 'Close Info' : 'More Info'}
          onMouseDown={onClick}
          size={size}
        />
      </S.Info>
    </Tooltip>
  );
};
