import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { forwardRef } from 'react';

import { useDebounce } from '@/hooks/debounce';

import * as S from './styles';

type Props = ComponentProps<typeof S.Switch> & {
  debounce?: boolean | number;
  dependencies?: any[];
};

export const Switch = forwardRef<HTMLButtonElement, Props>(
  ({ checked, children, debounce, defaultChecked, dependencies, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(checked || defaultChecked || false);
    const debounceDelay: number = (debounce === true && 700) || (typeof debounce === 'number' && debounce) || 0;
    const [deps, setDeps] = useState<any[]>([]);

    useEffect(() => {
      if (dependencies) setDeps(dependencies);
    }, [dependencies]);

    useEffect(() => {
      if (typeof checked === 'boolean') {
        setIsChecked(checked);
      }
    }, [checked]);

    const onCheckedChangeDebounced = useDebounce(
      (value: boolean) => {
        if (onCheckedChange) {
          onCheckedChange(value);
        }
      },
      deps,
      debounceDelay,
    );

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
