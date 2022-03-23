import { getAuth, signOut } from 'firebase/auth';
import analytics from './analytics';

export async function logOut() {
  const auth = getAuth();
  try {
    await signOut(auth);
    analytics.track('DC Logout');
  } catch (e) {
    console.error(e);
  }
}
