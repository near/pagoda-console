import type { Alerts } from '@pc/common/types/alerts';
import { useState } from 'react';

import { openToast } from '@/components/lib/Toast';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';

export function useVerifyDestinationInterval(destinationId: Alerts.DestinationId | undefined, onDone: () => void) {
  const { projectSlug } = useSureProjectContext();
  const [refetchEnabled, setRefetchEnabled] = useState(true);
  return useQuery(['/alerts/listDestinations', { projectSlug }], {
    enabled: Boolean(destinationId),
    onSuccess: (destinations) => {
      const destination = destinations.find((lookupDestination) => lookupDestination.id === destinationId);
      if (destination) {
        onDone();
        setRefetchEnabled(true);
        openToast({
          type: 'success',
          title: 'Destination Verified',
          description: 'Your destination is ready to go.',
        });
      }
    },
    refetchInterval: refetchEnabled ? 1000 : undefined,
  });
}
