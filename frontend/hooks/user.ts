import type { Users } from '@pc/common/types/core';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

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
