import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import useSWR from 'swr';

import { useAuthenticationStore } from '@/stores/authentication';
import analytics from '@/utils/analytics';
import { authenticatedPost, unauthenticatedPost } from '@/utils/http';

export function useAccount() {
  const { identity, authenticationStatus } = useIdentity();
  const {
    data: user,
    error,
    mutate,
  } = useSWR(identity ? ['/users/getAccountDetails' as const, identity.uid] : null, (key) => {
    return authenticatedPost(key);
  });

  return { user, authenticationStatus, error, mutate };
}

export function useIdentity() {
  const authenticationStatus = useAuthenticationStore((store) => store.status);
  const identity = useAuthenticationStore((store) => store.identity);

  return {
    authenticationStatus,
    identity,
  };
}

export function useIdentitySync() {
  const setIdentity = useAuthenticationStore((store) => store.setIdentity);
  const setStatus = useAuthenticationStore((store) => store.setStatus);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (result: FirebaseUser | null) => {
      setIdentity(result);
      setStatus(result ? 'AUTHENTICATED' : 'UNAUTHENTICATED');
    });

    return () => unsubscribe();
  }, [setIdentity, setStatus]);
}

export async function deleteAccount(uid: string | undefined) {
  try {
    await authenticatedPost('/users/deleteAccount');
    analytics.track('Delete account', {
      status: 'success',
      uid,
    });
    return true;
  } catch (e: any) {
    analytics.track('Delete account', {
      status: 'failure',
      uid,
      error: e.message,
    });
    // TODO
    console.error('Failed to delete account');
  }
  return false;
}

export async function resetPassword(email: string) {
  await unauthenticatedPost('/users/resetPassword', { email });
}
