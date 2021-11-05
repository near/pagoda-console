import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, FloatingLabel, Form } from 'react-bootstrap';
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
    // {
    //     name: 'Email',
    //     color: 'var(--color-white)',
    //     backgroundColor: 'var(--color-accent-purple)',
    //     providerInstance: new EmailAuthProvider(),
    //     icon: faEnvelope,
    // },
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

    function signInWithEmail(): void {
        console.log('email sign in');
    }

    return <div className='authContainer'>
        <Form>
            <FloatingLabel
                controlId="floatingInput"
                label="Email address"
                className="mb-3"
            >
                <Form.Control type="email" placeholder="name@example.com" />
            </FloatingLabel>
            <FloatingLabel controlId="floatingPassword" label="Password">
                <Form.Control type="password" placeholder="Password" />
            </FloatingLabel>
        </Form>
        <IconButton onClick={signInWithEmail} color='var(--color-white)' backgroundColor='var(--color-accent-purple)' active={authActive} text='Continue' />
        <div style={{margin: 'auto auto'}}>Sign Up</div>
        <hr />
        {providers.map((provider) => <ProviderButton key={provider.name} provider={provider} active={authActive} setAuthActive={setAuthActive} />)}
        <style jsx>{`
            .authContainer {
                display: flex;
                flex-direction: column;
                width: 18em;
                padding: 2em 0;
                justify-content: center;
            }
            .authContainer > :global(form) {
                margin-bottom: 0.5em;
            }
        `}</style>
    </div>
}

function ProviderButton(props: { provider: ProviderDetails, active: boolean, setAuthActive: (setTo: boolean) => void }) {
    function socialSignIn(provider: AuthProvider) {
        props.setAuthActive(false);
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
                props.setAuthActive(true);
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

    return <IconButton {...props.provider} onClick={() => socialSignIn(props.provider.providerInstance)} text={`Sign in with ${props.provider.name}`} active={props.active} />
}

// TODO exract auth active to hook
function IconButton(props: { onClick: () => void, image?: string, icon?: any, vector?: any, text: string, backgroundColor: string, color?: string, active: boolean, hoverBrightness?: number }) {
    const hasIcon = props.vector || props.icon || props.image;
    return <div className='buttonContainer'>
        <Button className={styles.authButton} variant='neutral' onClick={props.onClick} disabled={!props.active}>
            <div className='buttonContent'>
                {hasIcon && <div className='providerMark'>
                    {props.vector || props.icon && <FontAwesomeIcon icon={props.icon} /> || props.image && <img src={props.image} />}
                </div>}
                <span className='buttonText'>{props.text}</span>
            </div>
        </Button>
        <style jsx>{`
            img {
                width: 100%;
                height: 100%;
            }
            .buttonContainer {
                display: flex;
                flex-direction: column;
                margin: 0.5em 0;
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
                align-items: center;
            }
            .providerMark > :global(svg) {
                width: 100%;
                height: 100%;
            }
        `}</style>
        <style jsx>{`
            .buttonContent {
                justify-content: ${hasIcon ? 'flex-start' : 'center'};
            }
            .buttonContainer:hover {
                filter: brightness(${props.hoverBrightness || 0.9});
            }
            div > :global(.btn) {
                background-color: ${props.backgroundColor};
                color: ${props.color};
            }
        `}</style>
    </div >
}