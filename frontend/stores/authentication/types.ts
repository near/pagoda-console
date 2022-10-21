import type { User as FirebaseUser } from 'firebase/auth';

type AuthenticationStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export interface AuthenticationStore {
  identity: FirebaseUser | null;
  status: AuthenticationStatus;
  setIdentity: (identity: FirebaseUser | null) => void;
  setStatus: (status: AuthenticationStatus) => void;
}
