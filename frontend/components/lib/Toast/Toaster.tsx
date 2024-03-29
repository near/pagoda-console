import { StableId } from '@/utils/stable-ids';

import { Button } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { Flex } from '../Flex';
import type { Toast, ToastType } from './store';
import { useToasterStore } from './store';
import * as T from './Toast';

export function Toaster() {
  const toaster = useToasterStore();

  const iconsByType: Record<ToastType, string> = {
    info: '',
    error: 'alert-circle',
    success: 'check-circle',
  };

  function onOpenChange(open: boolean, toast: Toast) {
    if (!open) toaster.close(toast);
  }

  return (
    <T.Provider duration={5000}>
      {toaster.toasts.map((toast) => {
        const type = toast.type || 'info';
        const icon = toast.icon || iconsByType[type];

        return (
          <T.Root
            type={type}
            duration={toast.duration}
            open={toast.isOpen}
            onOpenChange={(open) => onOpenChange(open, toast)}
            key={toast.id}
          >
            {icon && <FeatherIcon icon={icon} css={{ alignSelf: 'center' }} size="m" />}

            <Flex stack gap="m">
              <Flex stack gap="none">
                {toast.title && <T.Title>{toast.title}</T.Title>}
                {toast.description && <T.Description>{toast.description}</T.Description>}
              </Flex>

              {toast.action && (
                <T.Action altText={toast.actionText!} asChild>
                  <Button
                    stableId={StableId.TOOLTIP_ACTION_BUTTON}
                    size="s"
                    color="transparent"
                    onClick={toast.action}
                    css={{
                      color: 'var(--color-cta-neutral-text)',
                      background: 'var(--color-cta-neutral)',
                      '&:hover': {
                        background: 'var(--color-cta-neutral-highlight)',
                      },
                    }}
                  >
                    {toast.actionText}
                  </Button>
                </T.Action>
              )}
            </Flex>

            <T.CloseButton css={{ alignSelf: !toast.title ? 'center' : undefined }} />
          </T.Root>
        );
      })}

      <T.Viewport />
    </T.Provider>
  );
}
