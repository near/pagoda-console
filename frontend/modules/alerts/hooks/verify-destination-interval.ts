import { useEffect } from 'react';
import type { KeyedMutator } from 'swr';

import { openToast } from '@/components/lib/Toast';

import type { Destination } from '../utils/types';

export function useVerifyDestinationInterval(
  destination: Destination | undefined,
  mutate: KeyedMutator<Destination[]>,
  setShow: (isOpen: boolean) => void,
) {
  useEffect(() => {
    if (!destination || destination.isValid) return;

    const interval = setInterval(async () => {
      const result = await mutate();
      const dest = result?.find((d) => d.id === destination.id);

      if (dest?.isValid) {
        clearInterval(interval);
        openToast({
          type: 'success',
          title: 'Destination Verified',
          description: 'Your destination is ready to go.',
        });
        setShow(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [destination, mutate, setShow]);
}
