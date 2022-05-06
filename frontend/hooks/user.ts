import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { authenticatedPost } from '@/utils/http';
import type { User } from '@/utils/types';

import { useOnMount } from './lifecycle';

export function useAccount(): { user?: User; error?: any; mutate: KeyedMutator<any> } {
  const identity = useIdentity();
  const {
    data: user,
    error,
    mutate,
  } = useSWR(identity ? ['/users/getAccountDetails', identity.uid] : null, (key) => {
    return authenticatedPost(key);
  });

  return { user, error, mutate };
}

export function useDisplayName(): string | null {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onIdTokenChanged(auth, (user: FirebaseUser | null) => {
      if (user?.displayName && displayName !== user?.displayName) {
        setDisplayName(user.displayName);
      }
    });

    return () => unsubscribe();
  }, [displayName]);

  return displayName;
}

export function useIdentity(): FirebaseUser | null {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useOnMount(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      setUser(user);
    });

    return () => unsubscribe();
  });

  return user;
}
