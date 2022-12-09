import { useEffect, useState } from 'react';

import { openToast } from '@/components/lib/Toast';
import { useQuery } from '@/hooks/query';
import { useSelectedProject } from '@/hooks/selected-project';

export function useVerifyDestinationInterval(destinationId: number | undefined, onDone: () => void) {
  const { project } = useSelectedProject();
  const [refetchEnabled, setRefetchEnabled] = useState(true);
  useEffect(() => setRefetchEnabled(true), [destinationId]);
  return useQuery(['/alerts/listDestinations', { projectSlug: project?.slug ?? 'unknown' }], {
    enabled: Boolean(destinationId && project),
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
