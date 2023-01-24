import type { Api } from '@pc/common/types/api';
import { useEffect } from 'react';
import type { KeyedMutator } from 'swr';

import { openToast } from '@/components/lib/Toast';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

export function useVerifyDestinationInterval(
  destination: Destination | undefined,
  mutate: KeyedMutator<Destination[]>,
  onVerify: (destination: Destination) => void,
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
