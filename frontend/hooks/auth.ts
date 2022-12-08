import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import useSWR from 'swr';

import { useAuthStore } from '@/stores/auth';
import analytics from '@/utils/analytics';
import { fetchApi } from '@/utils/http';

import { usePublicMode } from './public';

export function useAccount() {
  const { identity } = useAuth();
  const {
    data: user,
    error,
    mutate,
  } = useSWR(identity ? ['/users/getAccountDetails' as const, identity.uid] : null, (key) => {
    return fetchApi([key]);
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

export function useSignedInHandler() {
  const router = useRouter();
  const { deactivatePublicMode } = usePublicMode();

  const signedInHandler = useCallback(
    (defaultRedirectUrl: string | false) => {
      deactivatePublicMode();

      if (defaultRedirectUrl === false) return;

      const redirectUrl = sessionStorage.getItem('signInRedirectUrl') || defaultRedirectUrl;
      sessionStorage.removeItem('signInRedirectUrl');
      router.push(redirectUrl);
    },
    [deactivatePublicMode, router],
  );

  return signedInHandler;
}

export function useSignOut() {
  const { cache }: { cache: any } = useSWRConfig(); // https://github.com/vercel/swr/discussions/1494
  const router = useRouter();
  const { deactivatePublicMode } = usePublicMode();

  const signOut = useCallback(async () => {
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
      analytics.track('DC Logout');
      analytics.reset();
      cache.clear();
      deactivatePublicMode();
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  }, [deactivatePublicMode, cache, router]);

  return signOut;
}
