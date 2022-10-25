import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import useSWR from 'swr';

import { useAuthStore } from '@/stores/auth';
import analytics from '@/utils/analytics';
import { authenticatedPost, unauthenticatedPost } from '@/utils/http';
import type { User } from '@/utils/types';

/*
  TODO: Implement unauthed paths
  
  const unauthedPaths = [
    '/',
    '/register',
    '/ui',
    '/alerts/verify-email',
    '/alerts/unsubscribe-from-email-alert',
    '/pick-project-template/[templateSlug]',
  ];
*/

// TODO: Implement authed paths (all other routes)

export function useAccount() {
  const { identity } = useAuth();
  const {
    data: user,
    error,
    mutate,
  } = useSWR<User>(identity ? ['/users/getAccountDetails', identity.uid] : null, (key) => {
    return authenticatedPost(key);
  });

  return {
    error,
    mutate,
    user,
  };
}

export function useAuth() {
  const authStatus = useAuthStore((store) => store.status);
  const identity = useAuthStore((store) => store.identity);

  return {
    authStatus,
    identity,
  };
}

export function useAuthSync() {
  const setIdentity = useAuthStore((store) => store.setIdentity);
  const setStatus = useAuthStore((store) => store.setStatus);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (result: FirebaseUser | null) => {
      setIdentity(result);
      setStatus(result ? 'AUTHENTICATED' : 'UNAUTHENTICATED');
    });

    return () => unsubscribe();
  }, [setIdentity, setStatus]);
}

export function useLogOut() {
  const { cache }: { cache: any } = useSWRConfig(); // https://github.com/vercel/swr/discussions/1494
  const router = useRouter();

  const logOut = useCallback(async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      analytics.track('DC Logout');
      analytics.reset();
      cache.clear();
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  }, [cache, router]);

  return logOut;
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
