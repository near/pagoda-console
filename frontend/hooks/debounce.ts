import type { DebounceSettings } from 'lodash-es';
import { debounce } from 'lodash-es';
import { useMemo } from 'react';

export function useDebounce(handler: (...args: any) => any, wait?: number, options?: DebounceSettings) {
  return useMemo(
    () => debounce(handler, wait, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}
