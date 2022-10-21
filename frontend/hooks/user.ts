import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import analytics from '@/utils/analytics';
import { authenticatedPost, unauthenticatedPost } from '@/utils/http';
import type { User } from '@/utils/types';

type UserAuthState = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export function useAccount() {
  const { identity, userAuthState } = useIdentity();
  const {
    data: user,
    error,
    mutate,
  } = useSWR<User>(identity ? ['/users/getAccountDetails', identity.uid] : null, (key) => {
    return authenticatedPost(key);
  });

  return { user, userAuthState, error, mutate };
}

export function useIdentity() {
  const [identity, setIdentity] = useState<FirebaseUser | null>(null);
  const [userAuthState, setUserAuthState] = useState<UserAuthState>('LOADING');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (result: FirebaseUser | null) => {
      setIdentity(result);
      setUserAuthState(result ? 'AUTHENTICATED' : 'UNAUTHENTICATED');
    });

    return () => unsubscribe();
  }, []);

  return {
    identity,
    userAuthState,
  };
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
