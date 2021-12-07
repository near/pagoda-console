import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { getAuth, signInWithPopup, AuthProvider, onAuthStateChanged, signInWithEmailAndPassword, AuthError, createUserWithEmailAndPassword } from "firebase/auth";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ForgotPasswordModal from '../ForgotPasswordModal';

interface ProviderDetails {
    name: string,
    color?: string,
    backgroundColor: string,
    providerInstance: AuthProvider,
    image?: string,
    vector?: any,
    icon?: any,
    border?: boolean,
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
        border: true,
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

    useEffect(() => {
        const unregisterAuthObserver = onAuthStateChanged(getAuth(), user => {
            if (user && !user.emailVerified && user.providerData.length === 1 && user.providerData[0].providerId === 'password') {
                router.push('/verification?existing=true');
            } else if (user) {
                router.push('/projects');
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [router]);

    return <div className='authContainer'>
        <EmailAuth authActive />
        <div className='globalDivider' />
        <div className='socialContainer'>
            {providers.map((provider) => <ProviderButton key={provider.name} provider={provider} active={authActive} setAuthActive={setAuthActive} />)}
        </div>
        <div className='termsContainer'>
            <a>Terms and Conditions</a>
            <a>Privacy Policy</a>
        </div>
        <style jsx>{`
            .authContainer {
                display: flex;
                flex-direction: column;
                padding: 2em 0;
                justify-content: center;
                width: 100%;
            }
            .socialContainer {
                display: flex;
                flex-direction: column;
                row-gap: 1rem;
            }
            .termsContainer {
                margin-top: 1rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                color: var(--color-primary)
            }
        `}</style>
    </div>
}

interface ValidationFailure {
    email?: string,
    password?: string,
}

// TODO finalize validations
const emailRegex = /\w+@\w+\.\w+/;
const passwordRegex = /.{6,}/;

function EmailAuth(props: { authActive: boolean }) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [hasFailedSignIn, setHasFailedSignIn] = useState<boolean>(false);
    const [isRegistering, setIsRegistering] = useRegistrationStatus();
    const [errorAlert, setErrorAlert] = useState<string | null>();
    const [showResetModal, setShowResetModal] = useState<boolean>(false);

    const [validationFail, setValidationFail] = useState<ValidationFailure>({});

    const router = useRouter();

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

        setValidationFail(validations);
        return !failed;
    }

    function handleFormChange(type: 'email' | 'password', newValue: string): void {
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
        signInWithEmail();
    }

    // clear validation errors on switching between sign in and sign up
    useEffect(() => {
        setValidationFail({});
    }, [isRegistering]);

    return <div className='emailContainer'>
        {errorAlert && <Alert variant='danger'>{errorAlert}</Alert>}
        <Form noValidate onSubmit={handleSubmit}>
            <div className='formFieldsWrapper'>
                <Form.Group controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="name@example.com" value={email} onChange={(e) => handleFormChange('email', e.target.value)} isInvalid={!!validationFail.email} />
                    <Form.Control.Feedback type="invalid">
                        {validationFail.email}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="password" >
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder='Password' value={password} onChange={(e) => handleFormChange('password', e.target.value)} isInvalid={!!validationFail.password} />
                    <Form.Control.Feedback type="invalid">
                        {validationFail.password}
                    </Form.Control.Feedback>
                </Form.Group>
            </div>
            <IconButton type='submit' color='var(--color-white)' backgroundColor='var(--color-accent-purple)' active={props.authActive} text='Continue' />
        </Form>
        <Link href='/register' passHref>
            <Button variant='outline-primary'>Sign Up</Button>
        </Link>
        <div onClick={() => setShowResetModal(true)} className='forgotPassword' >
            Forgot Password?
        </div>
        <ForgotPasswordModal show={showResetModal} onHide={() => setShowResetModal(false)} />
        <style jsx>{`
            .emailContainer {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                justify-content: center;
            }
            .formFieldsWrapper {
                margin-bottom: 1.5rem;
                row-gap: 1rem;
                display: flex;
                flex-direction: column;
            }
            .forgotPassword {
                cursor: pointer;
                text-decoration: none;
                margin: 1rem auto 0;
            }
            .forgotPassword:hover {
                color: var(--color-primary)
            }
            .emailContainer :global(form) {
                margin-bottom: 1rem;
            }
        `}</style>
    </div>
}

function ProviderButton(props: { provider: ProviderDetails, active: boolean, setAuthActive: (setTo: boolean) => void }) {
    const { t } = useTranslation('login');
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

    return <IconButton {...props.provider} onClick={() => socialSignIn(props.provider.providerInstance)} text={`${t('continueWith')} ${props.provider.name}`} active={props.active} />
}

// TODO extract auth active to hook
function IconButton(props: { onClick?: () => void, image?: string, icon?: any, vector?: any, text: string, backgroundColor: string, color?: string, active: boolean, hoverBrightness?: number, type?: 'submit' | undefined, border?: boolean }) {
    const hasIcon = props.vector || props.icon || props.image;
    return <div className='buttonContainer'>
        <Button variant='neutral' type={props.type || 'button'} onClick={props.onClick} disabled={!props.active}>
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
            .buttonContainer :global(.btn) {
                height: 3rem;
            }
            .buttonContainer {
                display: flex;
                flex-direction: column;
                width: 100%;
            }
            .providerIcon {
                width: 100%;
                height: 100%;
            }
            .providerMark {
                width: 2rem;
                height: 2rem;
                margin-right: 1rem;
            }
            .buttonContent {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                margin: auto auto;
            }
            .providerMark > :global(svg) {
                width: 100%;
                height: 100%;
            }
        `}</style>
        <style jsx>{`
            .buttonContainer:hover {
                filter: brightness(${props.hoverBrightness || 0.9});
            }
            div > :global(.btn) {
                background-color: ${props.backgroundColor};
                color: ${props.color};
                border: ${props.border ? `1px solid ${props.color}` : 'none'}
            }
        `}</style>
    </div >
}
