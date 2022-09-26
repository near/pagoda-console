import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import * as S from './styles';

type RootProps = Omit<ComponentProps<typeof TooltipPrimitive.Root>, 'children'>;
type ContentProps = ComponentProps<typeof S.Content>;

interface Props extends ContentProps {
  children: ReactElement;
  content: ReactNode;
  root?: RootProps;
}

export const Tooltip = ({ children, content, root, side = 'top', sideOffset = 6, ...props }: Props) => {
  const delayDuration = root?.delayDuration || 200;

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={delayDuration} {...root}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

        <S.Content side={side} sideOffset={sideOffset} {...props}>
          {content}
          <S.Arrow offset={6} />
        </S.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
