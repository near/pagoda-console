import type { ComponentProps } from 'react';

import { Button } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import * as S from './styles';

type MessageType = 'info' | 'error' | 'success';

type Props = Omit<ComponentProps<typeof S.Container>, 'type'> & {
  content?: string;
  dismiss?: () => void;
  dismissText?: string;
  icon?: string;
  type?: MessageType;
};

export const Message = ({
  children,
  content,
  dismiss,
  dismissText,
  icon: iconOverride,
  type = 'info',
  ...props
}: Props) => {
  const iconsByType: Record<MessageType, string> = {
    info: 'info',
    error: 'alert-circle',
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

        {dismiss && (
          <Button size="s" color="neutral" onClick={dismiss}>
            {dismissText || 'Dismiss'}
          </Button>
        )}
      </Flex>
    </S.Container>
  );
};