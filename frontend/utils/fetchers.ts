import useSWR from 'swr';
import { useIdentity } from './hooks';
import { getIdToken } from 'firebase/auth';

// export function internalFetcher(token) {
//     const user = getAuth?.currentUser;
//     if (!user)
//     getIdToken(user)
// }

// export function useAuthenticatedSWR(key) {
//     const identity = useIdentity();

//     return useSWR(key, internalFetcher(getIdToken(identity)));
// }