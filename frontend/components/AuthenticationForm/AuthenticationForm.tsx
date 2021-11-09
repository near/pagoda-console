import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, FloatingLabel, Form, Alert } from 'react-bootstrap';
import { getAuth, signInWithPopup, AuthProvider, onAuthStateChanged, signInWithEmailAndPassword, AuthError, createUserWithEmailAndPassword } from "firebase/auth";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
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
//share reg status
function useRegistrationStatus() {
    return useState<boolean>(false);
}

export default function AuthenticationForm() {
    const router = useRouter();
    const [authActive, setAuthActive] = useState<boolean>(true);
    const [isRegistering, setIsRegistering] = useRegistrationStatus();

    useEffect(() => {
        const unregisterAuthObserver = onAuthStateChanged(getAuth(), user => {
            if (user) {
                router.push('/console');
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [router]);

    return <div className='authContainer'>
        <EmailAuth authActive />
        {!isRegistering && <>
            <hr />
            {providers.map((provider) => <ProviderButton key={provider.name} provider={provider} active={authActive} setAuthActive={setAuthActive} />)}
        </>}
        <style jsx>{`
            .authContainer {
                display: flex;
                flex-direction: column;
                width: 18em;
                padding: 2em 0;
                justify-content: center;
            }
        `}</style>
    </div>
}

interface ValidationFailure {
    email?: string,
    password?: string,
    confirmPassword?: string,
}

// TODO finalize validations
const emailRegex = /\w+@\w+\.\w+/;
const passwordRegex = /.{6,}/;

function EmailAuth(props: { authActive: boolean }) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [hasFailedSignIn, setHasFailedSignIn] = useState<boolean>(false);
    const [isRegistering, setIsRegistering] = useRegistrationStatus();
    const [errorAlert, setErrorAlert] = useState<string | null>();

    const [validationFail, setValidationFail] = useState<ValidationFailure>({});

    // TODO validation
    async function signInWithEmail(): Promise<void> {
        console.log('signing in');
        setHasFailedSignIn(false);
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setHasFailedSignIn(false);
        } catch (e) {
            setHasFailedSignIn(true);
            const error = e as AuthError;
            const errorCode = error.code;
            const errorMessage = error.message;
            // TODO determine error handling
            console.error(`${errorCode}: ${errorMessage}`);
            setValidationFail({ password: errorMessage });
            // setErrorAlert(errorMessage);
            // TODO REMOVE

            let errorValidationFailure: ValidationFailure = {};
            switch (errorCode) {
                case 'auth/user-not-found':
                    errorValidationFailure.email = 'User not found';
                    break;
                case 'auth/wrong-password':
                    errorValidationFailure.password = 'Incorrect password';
                    break;
                case 'auth/too-many-requests':
                    // hardcode message from Firebase for the time being
                    errorValidationFailure.password = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
                    break;
                default:
                    // TODO
                    errorValidationFailure.password = 'Something went wrong';
                    break;
            }
            setValidationFail(errorValidationFailure);
        }
    }

    //
    // TODO validation
    //
    async function signUpWithEmail(): Promise<void> {
        console.log('registering');
        const auth = getAuth();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (e) {
            const error = e as AuthError;
            const errorCode = error.code;
            const errorMessage = error.message;
            // TODO determine error handling
            console.error(`${errorCode}: ${errorMessage}`);
            setErrorAlert(errorMessage);
        }
    }

    // TODO review validations
    function validate() {
        const validations: ValidationFailure = {};
        let failed = false;
        if (!emailRegex.test(email)) {
            validations.email = 'Please enter a valid email address';
            failed = true
        }

        if (!passwordRegex.test(password)) {
            validations.password = 'Password must be at least 6 characters';
            failed = true;
        }

        if (isRegistering && confirmPassword !== password) {
            validations.confirmPassword = 'Passwords do not match';
            failed = true;
        }

        setValidationFail(validations);
        return !failed;
    }

    function handleFormChange(type: 'email' | 'password' | 'confirmPassword', newValue: string): void {
        setValidationFail({});
        errorAlert && setErrorAlert(null);
        hasFailedSignIn && setHasFailedSignIn(false);
        switch (type) {
            case 'email':
                setEmail(newValue);
                break;
            case 'password':
                setPassword(newValue);
                break;
            case 'confirmPassword':
                setConfirmPassword(newValue)
                break;

            default:
                const _exhaustiveCheck: never = type;
                break;
        }
    }

    function handleSubmit(e: FormEvent): void {
        e.preventDefault();

        // validation has side effect of showing messages
        if (!validate()) {
            return;
        }

        if (isRegistering) {
            signUpWithEmail();
        } else {
            signInWithEmail();
        }
    }

    // clear validation errors on switching between sign in and sign up
    useEffect(() => {
        setValidationFail({});
    }, [isRegistering]);

    return <div className='emailContainer'>
        {errorAlert && <Alert variant='danger'>{errorAlert}</Alert>}
        <Form noValidate onSubmit={handleSubmit}>
            <div className='formFieldsWrapper'>
                <FloatingLabel
                    controlId="floatingInput"
                    label="Email address"
                >
                    <Form.Control type="email" placeholder="name@example.com" value={email} onChange={(e) => handleFormChange('email', e.target.value)} isInvalid={!!validationFail.email} />
                    <Form.Control.Feedback type="invalid">
                        {validationFail.email}
                    </Form.Control.Feedback>
                </FloatingLabel>
                <FloatingLabel controlId="floatingPassword" label="Password">
                    <Form.Control type="password" placeholder={!isRegistering ? 'Password' : 'New Password'} value={password} onChange={(e) => handleFormChange('password', e.target.value)} isInvalid={!!validationFail.password} />
                    <Form.Control.Feedback type="invalid">
                        {validationFail.password}
                    </Form.Control.Feedback>
                </FloatingLabel>
                <div className='confirmField'>
                    {/* password managers prefer that fields are not added and removed from the DOM, so we add a wrapper div that we can set to display:none */}
                    <FloatingLabel controlId="floatingConfirmPassword" label="Confirm Password">
                        <Form.Control type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => handleFormChange('confirmPassword', e.target.value)} isInvalid={!!validationFail.confirmPassword} />
                        <Form.Control.Feedback type="invalid">
                            {validationFail.confirmPassword}
                        </Form.Control.Feedback>
                    </FloatingLabel>
                </div>
            </div>
            <IconButton type='submit' color='var(--color-white)' backgroundColor='var(--color-accent-purple)' active={props.authActive} text={!isRegistering ? 'Continue' : 'Sign Up'} />
        </Form>
        {/* <div style={{ margin: 'auto auto' }}>Sign Up</div> */}
        <div className='signUpContainer' >
            <Button onClick={() => setIsRegistering(!isRegistering)}>{!isRegistering ? 'Sign Up' : 'Cancel'}</Button>
        </div>
        <style jsx>{`
            .emailContainer {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                justify-content: center;
            }
            .formFieldsWrapper {
                margin-bottom: 1em;
            }
            .emailContainer > :global(.form-floating) {
                margin-bottom: 0.5em;
            }
            .signUpContainer {
                margin: auto auto;
            }
            .signUpContainer > :global(.btn) {
                background-color: transparent;
                border-width: 0;
                color: var(--color-accent-purple)
            }
            .signUpContainer > :global(.btn:hover) {
                filter: brightness(0.6)
            }
        `}</style>
        <style jsx>{`
            .confirmField {
                display: ${isRegistering ? 'block' : 'none'};
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

    return <IconButton {...props.provider} onClick={() => socialSignIn(props.provider.providerInstance)} text={`Continue with ${props.provider.name}`} active={props.active} />
}

// TODO exract auth active to hook
function IconButton(props: { onClick?: () => void, image?: string, icon?: any, vector?: any, text: string, backgroundColor: string, color?: string, active: boolean, hoverBrightness?: number, type?: 'submit' | undefined }) {
    const hasIcon = props.vector || props.icon || props.image;
    return <div className='buttonContainer'>
        <Button className={styles.authButton} variant='neutral' type={props.type || 'button'} onClick={props.onClick} disabled={!props.active}>
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
                height: 3rem;
            }
            .providerIcon {
                width: 100%;
                height: 100%;
            }
            .providerMark {
                width: 2em;
                height: 2em;
                margin: 0 1.25em;
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