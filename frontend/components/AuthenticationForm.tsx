import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form } from 'react-bootstrap';
import {
  getAuth,
  signInWithPopup,
  AuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  AuthError,
  getAdditionalUserInfo,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import ErrorModal from './modals/ErrorModal';
import Image from 'next/image';
import analytics from '../utils/analytics';
import { assertUnreachable } from '../utils/helpers';

import GithubMark from '../public/githubMark.png';
import GoogleMark from '../public/googleMark.png';

interface ProviderDetails {
  name: string;
  color?: string;
  backgroundColor: string;
  providerInstance: AuthProvider;
  image?: StaticImageData;
  vector?: any;
  icon?: any;
  border?: boolean;
  hoverBrightness?: number;
}

const providers: Array<ProviderDetails> = [
  {
    name: 'GitHub',
    color: 'var(--color-white)',
    backgroundColor: 'var(--color-black)',
    providerInstance: new GithubAuthProvider(),
    image: GithubMark,
    hoverBrightness: 1.5,
  },
  {
    name: 'Google',
    color: '#757575',
    border: true,
    backgroundColor: 'var(--color-white)',
    providerInstance: new GoogleAuthProvider(),
    image: GoogleMark,
  },
];

export default function AuthenticationForm() {
  const router = useRouter();
  const [authActive, setAuthActive] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unregisterAuthObserver = onAuthStateChanged(getAuth(), (user) => {
      if (
        user &&
        !user.emailVerified &&
        user.providerData.length === 1 &&
        user.providerData[0].providerId === 'password'
      ) {
        router.push('/verification?existing=true');
      } else if (user) {
        router.push('/projects');
      }
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, [router]);

  useEffect(() => {
    router.prefetch('/projects');
    router.prefetch('/verification');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function socialSignIn(provider: AuthProvider) {
    setAuthActive(false);
    const auth = getAuth();
    try {
      const socialResult = await signInWithPopup(auth, provider);
      const additional = getAdditionalUserInfo(socialResult);

      try {
        if (additional?.isNewUser) {
          analytics.alias(socialResult.user.uid);
          analytics.track(`DC Signed up with ${provider.providerId.split('.')[0].toUpperCase()}`);
        } else {
          analytics.track(`DC Login via ${provider.providerId.split('.')[0].toUpperCase()}`);
        }
      } catch (e) {
        // silently fail
      }
    } catch (error: any) {
      setAuthActive(true);
      const errorCode = error?.code;

      switch (errorCode) {
        case 'auth/account-exists-with-different-credential':
          // The provider account's email address.
          const email = error?.email || error?.customData?.email;

          if (!email) {
            // Couldn't get the email for some reason.
            setAuthError('There is already an account associated with that email.');
          } else {
            // Get sign-in methods for this email.
            const methods = await fetchSignInMethodsForEmail(auth, email);
            setAuthError(
              `You already have an account with the email ${email}. Try logging in with ${methods.join(' or ')}.`,
            );
          }
          break;
        case 'auth/cancelled-popup-request':
        case 'auth/popup-blocked':
        case 'auth/popup-closed-by-user':
          // do nothing, these can be silent errors
          break;

        default:
          setAuthError('Something went wrong. Please try again');
          break;
      }
    }
  }

  return (
    <div className="authContainer">
      <EmailAuth authActive />
      <div className="globalDivider" />
      <div className="socialContainer">
        <ErrorModal error={authError} setError={setAuthError} />
        {providers.map((provider) => (
          <ProviderButton key={provider.name} provider={provider} active={authActive} signInFunction={socialSignIn} />
        ))}
      </div>
      <div className="termsContainer">
        <a href="/Terms.pdf" target="_blank" rel="noopener noreferrer">
          Terms of Use
        </a>
        <a href="/PrivacyPolicy.pdf" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
      </div>
      <style jsx>{`
        .authContainer {
          display: flex;
          flex-direction: column;
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
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}

interface ValidationFailure {
  email?: string;
  password?: string;
}

const emailRegex = /\w+@\w+\.\w+/;
const passwordRegex = /.{6,}/;

function EmailAuth(props: { authActive: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasFailedSignIn, setHasFailedSignIn] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [validationFail, setValidationFail] = useState<ValidationFailure>({});

  async function signInWithEmail(): Promise<void> {
    setHasFailedSignIn(false);
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      analytics.track('DC Login using name + password', {
        status: 'success',
      });
      setHasFailedSignIn(false);
    } catch (e) {
      setHasFailedSignIn(true);
      const error = e as AuthError;
      const errorCode = error.code;

      analytics.track('DC Login using name + password', {
        status: 'failure',
        error: errorCode,
      });

      const errorValidationFailure: ValidationFailure = {};
      switch (errorCode) {
        case 'auth/user-not-found':
          errorValidationFailure.email = 'User not found';
          break;
        case 'auth/wrong-password':
          errorValidationFailure.password = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          // hardcode message from Firebase for the time being
          errorValidationFailure.password =
            'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
          break;
        default:
          // TODO
          errorValidationFailure.password = 'Something went wrong';
          break;
      }
      setValidationFail(errorValidationFailure);
    }
  }

  function validate() {
    const validations: ValidationFailure = {};
    let failed = false;
    if (!emailRegex.test(email)) {
      validations.email = 'Please enter a valid email address';
      failed = true;
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
    hasFailedSignIn && setHasFailedSignIn(false);
    switch (type) {
      case 'email':
        setEmail(newValue);
        break;
      case 'password':
        setPassword(newValue);
        break;
      default:
        assertUnreachable(type);
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

  return (
    <div className="emailContainer">
      <Form noValidate onSubmit={handleSubmit}>
        <div className="formFieldsWrapper">
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              isInvalid={!!validationFail.email}
            />
            <Form.Control.Feedback type="invalid">{validationFail.email}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              isInvalid={!!validationFail.password}
            />
            <Form.Control.Feedback type="invalid">{validationFail.password}</Form.Control.Feedback>
          </Form.Group>
        </div>
        <IconButton
          type="submit"
          color="var(--color-white)"
          backgroundColor="var(--color-accent-green)"
          active={props.authActive}
          text="Continue"
        />
      </Form>
      <Link href="/register" passHref>
        <Button onClick={() => analytics.track('DC Clicked Sign Up on Login')} variant="outline-primary">
          Sign Up
        </Button>
      </Link>
      <div onClick={() => setShowResetModal(true)} className="forgotPassword">
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
          color: var(--color-primary);
        }
        .emailContainer :global(form) {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

function ProviderButton(props: {
  provider: ProviderDetails;
  active: boolean;
  signInFunction: (provider: AuthProvider) => void;
}) {
  const { t } = useTranslation('login');

  return (
    <IconButton
      {...props.provider}
      onClick={() => props.signInFunction(props.provider.providerInstance)}
      text={`${t('continueWith')} ${props.provider.name}`}
      active={props.active}
    />
  );
}

function IconButton(
  props: {
    onClick?: () => void;
    text: string;
    active: boolean;
    type?: 'submit' | undefined;
  } & Partial<ProviderDetails>,
) {
  const hasIcon = props.vector || props.icon || props.image;
  return (
    <div className="buttonContainer">
      <Button variant="neutral" type={props.type || 'button'} onClick={props.onClick} disabled={!props.active}>
        <div className="buttonContent">
          {hasIcon && (
            <div className="providerMark">
              {props.vector ||
                (props.icon && <FontAwesomeIcon icon={props.icon} />) ||
                (props.image && <Image src={props.image} alt="sign-in provider icon" />)}
            </div>
          )}
          <span className="buttonText">{props.text}</span>
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
          border: ${props.border ? `1px solid ${props.color}` : 'none'};
        }
      `}</style>
    </div>
  );
}
