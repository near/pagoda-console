import { useState, useEffect } from 'react';
import router, { useRouter } from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import { getAuth, onAuthStateChanged, User, getIdToken } from "firebase/auth";
import { authenticatedPost } from './fetchers';


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;


export function useIdentity(): User | null {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const auth = getAuth()
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setUser(user);
        });

        return () => unsubscribe(); // TODO why lambda function?
    }, []);

    return user;
}

export function useRouteParam(paramName: string, redirectIfMissing?: string): string | null {
    const { query, isReady, pathname } = useRouter();
    const rawParam = query[paramName];
    const value = (rawParam && typeof rawParam === 'string') ? rawParam : null
    useEffect(() => {
        if (isReady && !value && redirectIfMissing) {
            router.push(redirectIfMissing);
        }
    }, [value, isReady, redirectIfMissing]);

    return value;
}