import type { Api } from '@pc/common/types/api';
import type { Projects } from '@pc/common/types/core';
import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { useAuth } from '@/hooks/auth';
import { authenticatedPost } from '@/utils/http';

type Keys = Api.Query.Output<'/projects/getKeys'>;

export function useApiKeys(project: Projects.ProjectSlug) {
  const { identity } = useAuth();

  const {
    data: keys,
    error,
    mutate,
  } = useSWR(identity ? ['/projects/getKeys' as const, project, identity.uid] : null, (key, project) => {
    return authenticatedPost(key, { project });
  });

  return { keys, error, mutate: mutate as KeyedMutator<Keys> };
}
