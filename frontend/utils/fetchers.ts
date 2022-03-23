import { getAuth, getIdToken } from 'firebase/auth';
import useSWR, { KeyedMutator, mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { PublicConfiguration, Revalidator, RevalidatorOptions, SWRConfiguration } from 'swr/dist/types';
import { Transaction } from '../components/explorer/components/transactions/types';
import { useIdentity } from './hooks';
import { Contract, Environment, User, Project, NetOption } from './interfaces';
import router, { useRouter } from 'next/router';
import { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';

// TODO decide proper crash if environment variables are not defined
// and remove unsafe type assertion
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

// export async function internalFetcher(url: string) {
//     const user = getAuth().currentUser;
//     if (!user) throw new Error('No authenticated user')

//     const headers = new Headers({
//         'Authorization': `Bearer ${await getIdToken(user)}`
//     });
//     return fetch(url, {
//         headers
//     }).then((res) => res.json())
// }

function getUID() {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error('No authenticated user found during SWR fetch');
  }
  return user.uid;
}

interface AuthenticatedPostOptions {
  forceRefresh?: boolean;
}

export async function authenticatedPost(endpoint: string, body?: Object, options?: AuthenticatedPostOptions) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No authenticated user');

  const headers = new Headers({
    Authorization: `Bearer ${await getIdToken(user, options?.forceRefresh)}`,
    'Content-Type': 'application/json',
  });
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  let resJson;
  try {
    if (res.status === 204) {
      resJson = {};
    } else {
      resJson = await res.json();
    }
  } catch (e) {
    if (res.ok) {
      throw new Error('Failed to convert to JSON');
    }
    // ignore failure to convert to JSON on error
  }
  if (!res.ok) {
    // TODO (P2+) it is generally frowned upon to throw a non-Error object, but we
    // need to pass the status code through to the onErrorRetry function. Find a better
    // way to do that
    throw resJson;
  }
  return resJson;
}

// data fetch requests via SWR -------------------------------

// we pass stable values instead of body objects because SWR requires stable values to determine when
// to re-fetch
// https://swr.vercel.app/docs/arguments#passing-objects
//
// we could potentially get around this by stringifying the POST json ahead of time and using that as the
// key
//
// overall there is probably a way that this could be significantly improved, but it does the job for the
// time being
//
// TODO: see if throwing useIdentity in here is the most effective way to guarantee firebase auth has
// loaded the user before attempting fetches which require a token

export function useContracts(
  project: string | null,
  environment?: number,
): { contracts?: Contract[]; error?: any; mutate: KeyedMutator<any> } {
  const identity = useIdentity();
  const {
    data: contracts,
    error,
    mutate,
  } = useSWR(
    identity && project && environment ? ['/projects/getContracts', project, environment, identity.uid] : null,
    (key: string, project: string | null, environment?: number) => {
      return authenticatedPost(key, { project, environment });
    },
  );

  return { contracts, error, mutate };
}

export function useEnvironment(environmentId?: number): {
  environment?: Environment;
  error?: any;
  mutate: KeyedMutator<any>;
} {
  // conditionally fetches if valid environmentId is passed
  const identity = useIdentity();
  const {
    data: environment,
    error,
    mutate,
  } = useSWR(
    identity && environmentId ? ['/projects/getEnvironmentDetails', environmentId, identity.uid] : null,
    (key: string, environmentId: number) => {
      return authenticatedPost(key, { environmentId });
    },
  );

  return { environment, error, mutate };
}

// NOTE: naming here can be cleaned up. The request was changed late in order
// to consolidate multiple calls. This returns closer to a Project record
export function useEnvironments(project: string | null): {
  environmentData?: Environment[];
  error?: any;
  mutate: KeyedMutator<any>;
} {
  const identity = useIdentity();
  const {
    data: environmentData,
    error,
    mutate,
  } = useSWR(
    identity && project ? ['/projects/getEnvironments', project, identity.uid] : null,
    (key: string, project: number) => {
      return authenticatedPost(key, { project });
    },
  );

  return { environmentData, error, mutate };
}

export function useAccount(): { user?: User; error?: any; mutate: KeyedMutator<any> } {
  const identity = useIdentity();
  const {
    data: user,
    error,
    mutate,
  } = useSWR(identity ? ['/users/getAccountDetails', identity.uid] : null, (key: string) => {
    return authenticatedPost(key);
  });

  return { user, error, mutate };
}

export function useProjects(): { projects?: Project[]; error?: any; mutate: KeyedMutator<any>; isValidating: boolean } {
  const identity = useIdentity();
  const {
    data: projects,
    error,
    mutate,
    isValidating,
  } = useSWR(identity ? ['/projects/list', identity.uid] : null, (key: string, project: number) => {
    return authenticatedPost(key);
  });

  return { projects, error, mutate, isValidating };
}

export function useProject(projectSlug: string | null): { project?: Project; error?: any } {
  const router = useRouter();
  const identity = useIdentity();

  useEffect(() => {
    router.prefetch('/projects');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: project, error } = useSWR(
    identity && projectSlug ? ['/projects/getDetails', projectSlug, identity.uid] : null,
    (key: string, projectSlug: number) => {
      return authenticatedPost(key, { slug: projectSlug });
    },
  );

  if ([400, 403].includes(error?.statusCode)) {
    window.sessionStorage.setItem('redirected', 'true');
    router.push('/projects');
  }

  return { project, error };
}

export function useApiKeys(
  project: string | null,
  swrOptions?: SWRConfiguration,
): { keys?: Partial<Record<NetOption, string>>; error?: any; mutate: KeyedMutator<any> } {
  const identity = useIdentity();
  const {
    data: keys,
    error,
    mutate,
  } = useSWR(
    identity && project ? ['/projects/getKeys', project, identity.uid] : null,
    (key: string, project: number) => {
      return authenticatedPost(key, { project });
    },
    swrOptions,
  );

  return { keys, error, mutate };
}

export function useRecentTransactions(
  contracts: string[],
  net: NetOption,
): { transactions: Transaction[]; error: any } {
  const identity = useIdentity();
  // TODO (P2+) look into whether using contracts as part of the SWR key will cause a large
  // amount of unnecessary caching, since every modification to the contract set will be a
  // separate key
  const { data: transactions, error } = useSWR(
    identity && contracts && net ? ['/projects/getTransactions', contracts.join(','), net, identity.uid] : null,
    (key: string, contracts: string, net: NetOption) => {
      return authenticatedPost(key, {
        contracts: contracts.split(','),
        net,
      });
    },
  );

  return { transactions, error };
}

export async function deleteProject(userId: string | null, slug: string, name: string) {
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

// * This is a modified version of the onErrorRetry function pulled from SWR source
// * in order to retain exponential backoff retry while adding custom conditions to
// * prevent retries such as on 403s. Hopefully the SWR team provides a cleaner solution
// * in the future and this can be removed
// *
// * Related Discussion: https://github.com/vercel/swr/discussions/1574
// *
// * Code pulled from:
// * https://github.com/vercel/swr/blob/72a54800662360e0c1f370e3fb32ee4f70020033/src/utils/config.ts
// *
// * Additional info: https://swr.vercel.app/docs/error-handling#error-retry
// *
// * This is a great candidate for making a PR back to an open source repo :)
export function customErrorRetry(
  err: any,
  __: string,
  config: Readonly<PublicConfiguration>,
  revalidate: Revalidator,
  opts: Required<RevalidatorOptions>,
): void {
  /*if (!preset.isVisible()) {
    // If it's hidden, stop. It will auto revalidate when refocusing.
    return
  }*/

  // custom for console
  switch (err.statusCode) {
    case 400:
    case 401:
    case 403:
    case 404:
      console.log(`breaking for status code of ${err.status}`);
      return;
  }

  const maxRetryCount = config.errorRetryCount;
  const currentRetryCount = opts.retryCount;

  // Exponential backoff
  const timeout =
    ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) * config.errorRetryInterval;

  if (maxRetryCount !== undefined && currentRetryCount > maxRetryCount) {
    return;
  }

  setTimeout(revalidate, timeout, opts);
}
