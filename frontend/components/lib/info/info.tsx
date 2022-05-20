import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import { Tooltip } from '../tooltip';
import * as S from './styles';

type Props = Omit<ComponentProps<typeof S.Info>, 'children'> & {
  content: string;
};

export const Info = ({ content }: Props) => {
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
      <S.Info aria-label={isOpen ? 'Close Info' : 'More Info'} onMouseDown={onClick}>
        <FontAwesomeIcon icon={faQuestion} />
      </S.Info>
    </Tooltip>
  );
};
