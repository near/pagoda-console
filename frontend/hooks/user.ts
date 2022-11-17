import type { Users } from '@pc/common/types/core';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import analytics from '@/utils/analytics';
import { authenticatedPost, unauthenticatedPost } from '@/utils/http';

export function useAccount() {
  const identity = useIdentity();
  const {
    data: user,
    error,
    mutate,
  } = useSWR(identity ? ['/users/getAccountDetails' as const, identity.uid] : null, (key) => {
    return authenticatedPost(key);
  });

  return { user, error, mutate };
}

type FlavoredUser = Omit<FirebaseUser, 'uid'> & { uid: Users.UserUid };

export function useIdentity(): FlavoredUser | null {
  const [user, setUser] = useState<FlavoredUser | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      setUser(user as FlavoredUser);
    });

    return () => unsubscribe();
  }, []);

  return user;
}

export async function deleteAccount(uid: Users.UserUid | undefined) {
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
