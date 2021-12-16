import { merge } from "lodash-es";
import { UserData, UsageData } from "./interfaces";

// this might make more sense as a custom hook
export function getUserData(uid: string): UserData | null {
    if (!uid) {
        throw new Error('No uid provided to cache');
    }
    const userDataRaw = localStorage.getItem(uid);
    const userData = userDataRaw ? JSON.parse(userDataRaw) as UserData : null;
    return userData;
}

// TODO (P2+) see if we can do type checking on newData based on updateKey
export function updateUserData(uid: string, update: Partial<Record<keyof UserData, any>>) {
    if (!uid) {
        throw new Error('No uid provided to cache');
    }
    const userData = getUserData(uid) || {};
    const newUserData = merge(userData, update);
    localStorage.setItem(uid, JSON.stringify(newUserData));
}