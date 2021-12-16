import { getAuth, signOut } from "firebase/auth";
import mixpanel from 'mixpanel-browser';

export async function logOut() {
    const auth = getAuth();
    try {
        await signOut(auth);
        mixpanel.track('DC Logout')
    } catch (e) {
        console.error(e);
    }
}