import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import { getAuth, onAuthStateChanged, User, getIdToken } from "firebase/auth";


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

const fetcher = async (url: string) => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('No authenticated user')

    const headers = new Headers({
        'Authorization': `Bearer ${await getIdToken(user)}`
    });
    return fetch(url, {
        headers
    }).then((res) => res.json())
}

export function useIdentity(): User | null {
    const router = useRouter();
    // must cast cache to any to work around bug in interface definition
    // https://github.com/vercel/swr/discussions/1494
    const { cache }: {cache: any} = useSWRConfig()
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const auth = getAuth()
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setUser(user);

            if(!user) {
                // user is signed out, clear all data and redirect back to login
                cache.clear();
                console.log('cache cleared');
                router.push('/');
            }
        })

        return () => unsubscribe(); // TODO why lambda function?
    }, [router, cache]);

    return user;
}

interface Account {
    id: number,
    uid: string,
    email?: string,
    name?: string,
    photoUrl?: string,
}

export function useAccount(): [Account?, any?] {
    const identity = useIdentity();

    // conditionally fetch if Firebase has loaded the user identity
    const { data: account, error }: { data?: Account, error?: any } = useSWR(identity ? [`${BASE_URL}/users/getAccountDetails`, identity.uid] : null, fetcher);

    return [
        account,
        error
    ];
}