import type { ComponentProps } from 'react';

import { Button } from '../Button';
import { FeatherIcon } from '../FeatherIcon';
import { openToast } from '../Toast';

type Props = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  content?: string;
  value?: string;
};

export function CopyButton({ content, value, ...props }: Props) {
  function copy() {
    navigator.clipboard.writeText(value || content || '');
    openToast({
      type: 'success',
      title: 'Copied to clipboard.',
    });
  }

  return (
    <Button color="neutral" size="s" onClick={copy} {...props} aria-label="Copy to Clipboard">
      {content}
      <FeatherIcon icon="copy" size="xs" />
    </Button>
  );
}
