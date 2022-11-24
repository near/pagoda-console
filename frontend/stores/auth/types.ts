import type { Users } from '@pc/common/types/core';
import type { User as FirebaseUser } from 'firebase/auth';

type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

type FlavoredUser = Omit<FirebaseUser, 'uid'> & { uid: Users.UserUid };

export interface AuthStore {
  identity: FlavoredUser | null;
  status: AuthStatus;
  setIdentity: (identity: FlavoredUser | null) => void;
  setStatus: (status: AuthStatus) => void;
}
