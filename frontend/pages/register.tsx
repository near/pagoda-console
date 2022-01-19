import { Form, Button, Alert } from 'react-bootstrap';
import { useSimpleLayout } from "../utils/layouts";
import Link from 'next/link';
import { getAuth, createUserWithEmailAndPassword, AuthError, onAuthStateChanged, sendEmailVerification, updateProfile } from 'firebase/auth'
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authenticatedPost } from '../utils/fetchers';
import { usePageTracker } from '../utils/hooks';
import mixpanel from 'mixpanel-browser';

interface ValidationFailure {
    email?: string,
    password?: string,
    confirmPassword?: string,
    displayName?: string,
}

const emailRegex = /\w+@\w+\.\w+/;
const passwordRegex = /.{6,}/;

const onFocus = () => {
    console.log('Tab is in focus');
    getAuth().currentUser?.reload();
};

export default function Register() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [validationFail, setValidationFail] = useState<ValidationFailure>({});
    const [errorAlert, setErrorAlert] = useState<string | null>();

    const router = useRouter();

    useEffect(() => {
        const unregisterAuthObserver = onAuthStateChanged(getAuth(), async user => {
            if (user && !user.emailVerified) {
                try {
                    await updateProfile(user, {
                        displayName
                    });

                    await sendEmailVerification(user);
                    router.push('/verification');
                } catch (e) {
                    // TODO
                    console.error(e);
                }
            } else if (user) {
                // If the user is already verified and they go to /register, let's reroute them.
                router.push('/new-project');
                console.log('verified');
            }
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [router, displayName]);

    useEffect(() => {
        router.prefetch('/verification');
        router.prefetch('/new-project');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        window.addEventListener('focus', onFocus);
        return () => {
            window.removeEventListener('focus', onFocus);
        }
    }, [])

    async function signUpWithEmail(): Promise<void> {
        const auth = getAuth();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            mixpanel.track('DC Signed up with email', {
                status: 'success'
            });
        } catch (e) {
            const error = e as AuthError;
            const errorCode = error.code;
            const errorMessage = error.message;
            // TODO determine error handling
            console.error(`${errorCode}: ${errorMessage}`);
            setErrorAlert(errorMessage);
            mixpanel.track('DC Signed up with email', {
                status: 'failure',
                error: errorCode
            });
        }
    }

    function handleSubmit(e: FormEvent): void {
        e.preventDefault();
        mixpanel.track('DC Submitted email registration form');

        // validation has side effect of showing messages
        if (!validate()) {
            mixpanel.track('DC Registration form validation failed')
            return;
        }

        signUpWithEmail();
    }

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

        if (confirmPassword !== password) {
            validations.confirmPassword = 'Passwords do not match';
            failed = true;
        }

        if (!displayName) {
            validations.displayName = 'Please enter a display name';
            failed = true;
        }

        setValidationFail(validations);
        return !failed;
    }

    function handleFormChange(type: 'email' | 'password' | 'confirmPassword' | 'displayName', newValue: string): void {
        setValidationFail({});
        errorAlert && setErrorAlert(null); // TODO TODO
        // hasFailedSignIn && setHasFailedSignIn(false);
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
            case 'displayName':
                setDisplayName(newValue)
                break;

            default:
                const _exhaustiveCheck: never = type;
                break;
        }
    }

    return (
        <div className='pageContainer'>
            <Form noValidate onSubmit={handleSubmit}>
                <div className='formFields'>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" onChange={(e) => handleFormChange('email', e.target.value)} isInvalid={!!validationFail.email} placeholder='name@example.com' />
                        <Form.Control.Feedback type="invalid">
                            {validationFail.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" onChange={(e) => handleFormChange('password', e.target.value)} isInvalid={!!validationFail.password} placeholder='6+ characters' />
                        <Form.Control.Feedback type="invalid">
                            {validationFail.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formBasicConfirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" onChange={(e) => handleFormChange('confirmPassword', e.target.value)} isInvalid={!!validationFail.confirmPassword} />
                        <Form.Control.Feedback type="invalid">
                            {validationFail.confirmPassword}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formBasicDisplayName">
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control onChange={(e) => handleFormChange('displayName', e.target.value)} isInvalid={!!validationFail.displayName} placeholder='John Nearian' />
                        <Form.Control.Feedback type="invalid">
                            {validationFail.displayName}
                        </Form.Control.Feedback>
                    </Form.Group>
                </div>
                <Button variant="primary" type="submit">
                    Sign Up
                </Button>
            </Form>
            {errorAlert && <Alert variant='danger'>{errorAlert}</Alert>}
            <hr />
            <Link href='/'><a>I already have an account</a></Link>
            <style jsx>{`
            .pageContainer {
                display: flex;
                flex-direction: column;
                width: 22.25rem;
            }
            .formFields {
                display: flex;
                flex-direction: column;
                row-gap: 1rem;
                margin-bottom: 1.5rem;
            }
            .pageContainer :global(.btn) {
                width: 100%;
            }
            a {
                margin: 0 auto;
            }
        `}</style>
        </div>
    )
}

Register.getLayout = useSimpleLayout;