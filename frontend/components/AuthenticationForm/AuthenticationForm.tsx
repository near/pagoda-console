import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from 'react-bootstrap';
import { getAuth, signInWithPopup, AuthProvider, onAuthStateChanged } from "firebase/auth";
import { GithubAuthProvider, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import styles from './AuthenticationForm.module.css'

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

interface ProviderDetails {
    name: string,
    color?: string,
    backgroundColor: string,
    providerInstance: AuthProvider,
    image?: string,
    vector?: any,
    icon?: any,
    hoverBrightness?: number,
}

const providers: Array<ProviderDetails> = [
    {
        name: 'GitHub',
        color: 'var(--color-white)',
        backgroundColor: 'var(--color-black)',
        providerInstance: new GithubAuthProvider(),
        image: 'githubMark.png',
        hoverBrightness: 1.5
    },
    {
        name: 'Google',
        color: '#757575',
        backgroundColor: 'var(--color-white)',
        providerInstance: new GoogleAuthProvider(),
        image: 'googleMark.png',
    },
    {
        name: 'Email',
        color: 'var(--color-white)',
        backgroundColor: 'var(--color-accent-purple)',
        providerInstance: new EmailAuthProvider(),
        icon: faEnvelope,
    },
]

export default function AuthenticationForm() {
    const router = useRouter();
    const [authActive, setAuthActive] = useState<boolean>(true);

    useEffect(() => {
        const unregisterAuthObserver = onAuthStateChanged(getAuth(), user => {
            if (user) {
                router.push('/console');
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [router]);

    function signIn(provider: AuthProvider) {
        setAuthActive(false);
        const auth = getAuth();
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a GitHub Access Token. You can use it to access the GitHub API.
                // const credential = GithubAuthProvider.credentialFromResult(result);
                // const token = credential.accessToken;

                // The signed-in user info.
                const user = result.user;
                // ...
            }).catch((error) => {
                setAuthActive(true);
                console.error(error);
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = GithubAuthProvider.credentialFromError(error);
                // ...
            });
    }

    return <div className='container'>
        {providers.map((provider) => <ProviderButton key={provider.name} provider={provider} signIn={signIn} active={authActive} />)}
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: column;
                width: 20em;
                padding: 2em 0;
            }
        `}</style>
    </div>
}

function ProviderButton(props: { provider: ProviderDetails, signIn: Function, active: boolean }) {
    return <div className='container'>
        <Button className={styles.authButton} variant='neutral' style={{backgroundColor: props.provider.backgroundColor, color: props.provider.color}} onClick={() => props.signIn(props.provider.providerInstance)} disabled={!props.active}>
            <div className='buttonContent'>
                <div className='providerMark'>
                    {props.provider.vector || props.provider.icon && <FontAwesomeIcon style={{width: '100%', height: '100%'}} icon={props.provider.icon} /> || props.provider.image && <img src={props.provider.image}/>}
                </div>
            <span className='buttonText'>Sign In with {props.provider.name}</span>
            </div>
        </Button>
        <style jsx>{`
            img {
                width: 100%;
                height: 100%;
            }
            .container {
                display: flex;
                flex-direction: column;
                margin-bottom: 1em;
                width: 100%;
                height: 3em;
            }
            .providerIcon {
                width: 100%;
                height: 100%;
            }
            .providerMark {
                width: 2em;
                height: 2em;
                margin: 0 1.5em;
            }
            .buttonContent {
                display: flex;
                flex-direction: row;
                width: 100%;
                height: 100%;
                justify-content: flex-start;
                align-items: center;
            }
            .buttonText {
            }
        `}</style>
        <style jsx>{`
            .container:hover {
                filter: brightness(${props.provider.hoverBrightness || 0.9});
            }
        `}</style>
    </div >
}