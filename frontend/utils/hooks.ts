import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import firebase from 'firebase';

function useIdentity() {
    const router = useRouter();
    const [user, setUser] = useState<firebase.User>();

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            if (user) {
                setUser(user);
            } else {
                // user is signed out, redirect back to login
                router.push('/');
            }
        })

        return () => unsubscribe(); // TODO why lambda function?
    }, [router]);

    return { user };
}

function useAccount() {
    const identity = useIdentity();

    // TODO fetch account info
}