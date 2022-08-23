import type { DebounceSettings } from 'lodash-es';
import { debounce } from 'lodash-es';
import { useMemo, useRef } from 'react';

export function useDebounce(handler: (...args: any) => any, wait?: number, options?: DebounceSettings) {
  const optionsRef = useRef(options);

  return useMemo(() => {
    return debounce(handler, wait, optionsRef.current);
  }, [handler, wait]);
}
