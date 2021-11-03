import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import firebase from 'firebase';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

const fetcher = async (url: string) => {
    const headers = new Headers({
        'Authorization': `Bearer ${await firebase.auth().currentUser?.getIdToken()}`
    });
    return fetch(url, {
        headers
    }).then((res) => res.json())
}

export function useIdentity(): firebase.User | null {
    const router = useRouter();
    // must cast cache to any to work around bug in interface definition
    // https://github.com/vercel/swr/discussions/1494
    const { cache }: {cache: any} = useSWRConfig()
    const [user, setUser] = useState<firebase.User | null>(null);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            setUser(user);

            if(!user) {
                // user is signed out, clear all data and redirect back to login
                cache.clear();
                console.log('cache cleared');
                router.push('/');
            }
        })

        return () => unsubscribe(); // TODO why lambda function?
    }, [router]);

    return user;
}

interface Account {
    id: number,
    uid: string,
    email?: string,
    photoUrl?: string,
    name?: string,
    apiKey: string,
    apiKeyTest: string,
}

export function useAccount(): [Account?, any?] {
    const identity = useIdentity();

    // conditionally fetch if Firebase has loaded the user identity
    const { data: account, error }: { data?: Account, error?: any } = useSWR(identity ? [`${BASE_URL}/user/getAccountDetails`, identity.uid] : null, fetcher);

    return [
        account,
        error
    ];
}