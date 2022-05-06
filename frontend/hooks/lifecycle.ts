import type { EffectCallback } from 'react';
import { useEffect } from 'react';

export function useOnMount(handler: EffectCallback) {
  return useEffect(() => {
    return handler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
