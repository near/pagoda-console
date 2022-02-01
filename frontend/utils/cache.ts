import { getAuth } from 'firebase/auth';
import { merge } from "lodash-es";
import { UserData, UsageData } from "./interfaces";

export function getCurrentUserData(): UserData | null {
    const user = getAuth().currentUser?.uid;
    if (!user) {
        throw new Error('No authed user');
    }
    return getUserData(user);
}

// this might make more sense as a custom hook
export function getUserData(uid: string): UserData | null {
    if (!uid) {
        throw new Error('No uid provided to cache');
    }
    const userDataRaw = localStorage.getItem(uid);
    const userData = userDataRaw ? JSON.parse(userDataRaw) as UserData : null;
    return userData;
}

// TODO (post ETHDenver) clean up these methods, we shouldnt need a version for current and a generic version
export function updateCurrentUserData(update: Partial<Record<keyof UserData, any>>): void {
    const user = getAuth().currentUser?.uid;
    if (!user) {
        throw new Error('No authed user');
    }
    return updateUserData(user, update);
}

// TODO (P2+) see if we can do type checking on newData based on updateKey
export function updateUserData(uid: string, update: Partial<Record<keyof UserData, any>>): void {
    if (!uid) {
        throw new Error('No uid provided to cache');
    }
    const userData = getUserData(uid) || {};
    const newUserData = merge(userData, update);
    localStorage.setItem(uid, JSON.stringify(newUserData));
}