import mixpanel from 'mixpanel-browser';
import { useRouter } from 'next/router';
import type { KeyedMutator } from 'swr';
import useSWR from 'swr';
import { mutate } from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { Project } from '@/utils/types';

import { useOnMount } from './lifecycle';

export async function deleteProject(userId: string | undefined, slug: string, name: string) {
  try {
    await authenticatedPost('/projects/delete', { slug });
    mixpanel.track('DC Remove Project', {
      status: 'success',
      name,
    });
    // Update the SWR cache before a refetch for better UX.
    mutate<Project[]>(userId ? ['/projects/list', userId] : null, async (projects) => {
      return projects?.filter((p) => p.slug !== slug);
    });
    return true;
  } catch (e: any) {
    mixpanel.track('DC Remove Project', {
      status: 'failure',
      name,
      error: e.message,
    });
    // TODO
    console.error('Failed to delete project');
  }
  return false;
}

export function useProject(projectSlug: string | undefined): { project?: Project; error?: any } {
  const router = useRouter();
  const identity = useIdentity();

  useOnMount(() => {
    router.prefetch('/projects');
  });

  const { data: project, error } = useSWR(
    identity && projectSlug ? ['/projects/getDetails', projectSlug, identity.uid] : null,
    (key, projectSlug) => {
      return authenticatedPost(key, { slug: projectSlug });
    },
  );

  if ([400, 403].includes(error?.statusCode)) {
    window.sessionStorage.setItem('redirected', 'true');
    router.push('/projects');
  }

  return { project, error };
}

export function useProjects(): { projects?: Project[]; error?: any; mutate: KeyedMutator<any>; isValidating: boolean } {
  const identity = useIdentity();
  const {
    data: projects,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/projects/list', identity.uid] : null, (key) => {
    return authenticatedPost(key);
  });

  return { projects, error, mutate, isValidating };
}
