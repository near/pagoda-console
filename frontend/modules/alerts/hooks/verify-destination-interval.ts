import { useEffect } from 'react';
import type { KeyedMutator } from 'swr';

import { openToast } from '@/components/lib/Toast';

export function useVerifyDestinationInterval<D extends { id: number; isValid: boolean }>(
  destination: D | undefined,
  mutate: KeyedMutator<D[]>,
  onVerify: (destination: D) => void,
) {
  useEffect(() => {
    if (!destination || destination.isValid) {
      return;
    }

    const interval = setInterval(async () => {
      const nextDestinations = await mutate();
      if (!nextDestinations) {
        return;
      }
      const nextDestination = nextDestinations.find((lookupDestination) => lookupDestination.id === destination.id);
      if (!nextDestination || !nextDestination.isValid) {
        return;
      }

      clearInterval(interval);

      openToast({
        type: 'success',
        title: 'Destination Verified',
        description: 'Your destination is ready to go.',
      });

      onVerify(nextDestination);
    }, 1000);

    return () => clearInterval(interval);
  }, [destination, mutate, onVerify]);
}
