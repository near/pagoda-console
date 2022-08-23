import type { ComponentProps } from 'react';
import { useCallback } from 'react';
import { useEffect, useState } from 'react';
import { forwardRef } from 'react';

import { useDebounce } from '@/hooks/debounce';

import * as S from './styles';

type Props = ComponentProps<typeof S.Switch> & {
  debounce?: boolean | number;
};

export const Switch = forwardRef<HTMLButtonElement, Props>(
  ({ checked, children, debounce, defaultChecked, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(checked || defaultChecked || false);
    const debounceDelay: number = (debounce === true && 700) || (typeof debounce === 'number' && debounce) || 0;

    useEffect(() => {
      if (typeof checked === 'boolean') {
        setIsChecked(checked);
      }
    }, [checked]);

    const onCheckedChangeDebouncedHandler = useCallback(
      (value: boolean) => {
        if (onCheckedChange) {
          onCheckedChange(value);
        }
      },
      [onCheckedChange],
    );

    const onCheckedChangeDebounced = useDebounce(onCheckedChangeDebouncedHandler, debounceDelay);

    useEffect(() => {
      return () => {
        onCheckedChangeDebounced.cancel();
      };
    }, [onCheckedChangeDebounced]);

    function onCheckedChangeInternal(value: boolean) {
      setIsChecked(value);

      if (debounce) {
        onCheckedChangeDebounced(value);
      } else if (onCheckedChange) {
        onCheckedChange(value);
      }
    }

    return (
      <S.Switch checked={isChecked} onCheckedChange={onCheckedChangeInternal} ref={ref} {...props}>
        <S.SwitchThumb>{children}</S.SwitchThumb>
      </S.Switch>
    );
  },
);
Switch.displayName = 'Switch';
