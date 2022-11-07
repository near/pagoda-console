import type { User as FirebaseUser } from 'firebase/auth';

type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export interface AuthStore {
  identity: FirebaseUser | null;
  status: AuthStatus;
  githubToken?: string;
  setIdentity: (identity: FirebaseUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setGithubToken: (githubToken?: string) => void;
}
