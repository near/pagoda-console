import type { ComponentProps } from 'react';

import { StableId } from '@/utils/stable-ids';

import { Button } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import * as S from './styles';

type MessageType = 'info' | 'error' | 'success' | 'warning';

type Props = Omit<ComponentProps<typeof S.Container>, 'type'> & {
  content?: string;
  onClickButton?: () => void;
  buttonText?: string;
  icon?: string;
  type?: MessageType;
};

export const Message = ({
  children,
  content,
  onClickButton,
  buttonText,
  icon: iconOverride,
  type = 'info',
  ...props
}: Props) => {
  const iconsByType: Record<MessageType, string> = {
    info: 'info',
    error: 'alert-circle',
    warning: 'alert-triangle',
    success: 'check-circle',
  };

  const icon = iconOverride || iconsByType[type];

  if (!content && !children) return null;

  return (
    <S.Container type={type} {...props} role="alert">
      <Flex align="center" justify="spaceBetween">
        <Flex align="center">
          <FeatherIcon icon={icon} />
          {children ? (
            <Flex stack gap="none">
              {children}
            </Flex>
          ) : (
            <S.Content>{content}</S.Content>
          )}
        </Flex>

        {onClickButton && (
          <Button stableId={StableId.MESSAGE_DISMISS_BUTTON} size="s" color="neutral" onClick={onClickButton}>
            {buttonText || 'Dismiss'}
          </Button>
        )}
      </Flex>
    </S.Container>
  );
};
