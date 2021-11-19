import { getAuth, getIdToken } from "firebase/auth";
import useSWR, { KeyedMutator } from "swr";
import { useIdentity } from "./hooks";
import { Contract, Environment, User, Project } from "./interfaces";

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
    throw new Error("No authenticated user found during SWR fetch");
  }
  return user.uid;
}

// function postFetcher() {

// }

export async function authenticatedPost(endpoint: string, body?: Object) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("No authenticated user");

  const headers = new Headers({
    Authorization: `Bearer ${await getIdToken(user)}`,
    "Content-Type": "application/json",
  });
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  let resJson;
  try {
    resJson = await res.json();
  } catch (e) {
    if (res.ok) {
      throw new Error("Failed to convert to JSON");
    }
    // ignore failure to convert to JSON on error
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${resJson?.message}`);
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
  environment?: number
): { contracts?: Contract[]; error?: any; mutate: KeyedMutator<any> } {
  const identity = useIdentity();
  const {
    data: contracts,
    error,
    mutate,
  } = useSWR(
    identity && project && environment
      ? ["/projects/getContracts", project, environment, identity.uid]
      : null,
    (key: string, project: string | null, environment?: number) => {
      return authenticatedPost(key, { project, environment });
    }
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
    identity && environmentId
      ? ["/projects/getEnvironmentDetails", environmentId, identity.uid]
      : null,
    (key: string, environmentId: number) => {
      return authenticatedPost(key, { environmentId });
    }
  );
  return { environment, error, mutate };
}

// NOTE: naming here can be cleaned up. The request was changed late in order
// to consolidate multiple calls. This returns closer to a Project record
export function useEnvironments(project: string | null): {
  environmentData?: { project: Project, environments: Environment[] };
  error?: any;
  mutate: KeyedMutator<any>;
} {
  const identity = useIdentity();
  const {
    data: environmentData,
    error,
    mutate,
  } = useSWR(
    identity && project
      ? ["/projects/getEnvironments", project, identity.uid]
      : null,
    (key: string, project: number) => {
      return authenticatedPost(key, { project });
    }
  );
  return { environmentData, error, mutate };
}

export function useAccount(): {
  user?: User;
  error?: any;
  mutate: KeyedMutator<any>;
} {
  const identity = useIdentity();
  const {
    data: user,
    error,
    mutate,
  } = useSWR(
    identity ? ["/users/getAccountDetails", identity.uid] : null,
    (key: string) => {
      return authenticatedPost(key);
    }
  );
  return { user, error, mutate };
}

export function useProjects(): {
  projects?: Project[];
  error?: any;
  mutate: KeyedMutator<any>;
} {
  const identity = useIdentity();
  const {
    data: projects,
    error,
    mutate,
  } = useSWR(
    identity ? ["/projects/list", identity.uid] : null,
    (key: string, project: number) => {
      return authenticatedPost(key);
    }
  );
  return { projects, error, mutate };
}
