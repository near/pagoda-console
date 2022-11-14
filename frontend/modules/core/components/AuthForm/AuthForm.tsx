import type { AuthProvider } from 'firebase/auth';
import {
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/router';
// import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useSignedInHandler } from '@/hooks/auth';
import { usePublicMode } from '@/hooks/public';
import GithubIconSvg from '@/public/images/icons/github.svg';
import GoogleIconSvg from '@/public/images/icons/google.svg';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

import { EmailForm } from './EmailForm';

interface Props {
  onSignIn?: () => void;
}

interface ProviderDetails {
  name: string;
  color: string;
  backgroundColor: string;
  backgroundColorHover: string;
  providerInstance: AuthProvider;
  icon: () => JSX.Element;
  stableId: StableId;
}

const providers: Array<ProviderDetails> = [
  {
    name: 'GitHub',
    color: '#ffffff',
    backgroundColor: '#000000',
    backgroundColorHover: '#222222',
    providerInstance: new GithubAuthProvider(),
    icon: GithubIconSvg,
    stableId: StableId.AUTHENTICATION_FORM_SIGN_IN_WITH_GITHUB_BUTTON,
  },
  {
    name: 'Google',
    color: '#757575',
    backgroundColor: '#ffffff',
    backgroundColorHover: '#eeeeee',
    providerInstance: new GoogleAuthProvider(),
    icon: GoogleIconSvg,
    stableId: StableId.AUTHENTICATION_FORM_SIGN_IN_WITH_GOOGLE_BUTTON,
  },
];

export function AuthForm({ onSignIn }: Props) {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const signedInHandler = useSignedInHandler();
  const { publicModeIsActive } = usePublicMode();

  useEffect(() => {
    router.prefetch('/projects');
    router.prefetch('/verification');
  }, [router]);

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
        if (onSignIn) {
          signedInHandler(false);
          onSignIn();
        } else {
          signedInHandler('/projects');
        }
      }
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, [onSignIn, router, signedInHandler]);

  async function socialSignIn(provider: AuthProvider) {
    const cachedPublicModeIsActive = publicModeIsActive;
    setIsAuthenticating(true);
    const auth = getAuth();

    try {
      const socialResult = await signInWithPopup(auth, provider);
      const additional = getAdditionalUserInfo(socialResult);

      try {
        if (additional?.isNewUser) {
          analytics.track(`DC Signed up with ${provider.providerId.split('.')[0].toUpperCase()}`);

          if (cachedPublicModeIsActive) {
            analytics.track(`DC Public Mode Sign Up`);
          }
        } else {
          analytics.track(`DC Login via ${provider.providerId.split('.')[0].toUpperCase()}`);
        }
      } catch (e) {
        // silently fail
      }
    } catch (error: any) {
      setIsAuthenticating(false);

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
    <Flex gap="l" stack>
      <EmailForm isAuthenticating={isAuthenticating} setIsAuthenticating={setIsAuthenticating} />

      <HR />

      <Flex stack>
        {providers.map((provider) => (
          <ProviderButton
            key={provider.name}
            isAuthenticating={isAuthenticating}
            provider={provider}
            signInFunction={socialSignIn}
          />
        ))}
      </Flex>

      <ErrorModal error={authError} setError={setAuthError} />
    </Flex>
  );
}

function ProviderButton(props: {
  isAuthenticating: boolean;
  provider: ProviderDetails;
  signInFunction: (provider: AuthProvider) => void;
}) {
  // const { t } = useTranslation('login');
  const Icon = props.provider.icon;

  return (
    <Button
      stableId={props.provider.stableId}
      stretch
      disabled={props.isAuthenticating}
      css={{
        color: props.provider.color,
        backgroundColor: props.provider.backgroundColor,
        '&:hover': {
          backgroundColor: props.provider.backgroundColorHover,
        },
        svg: {
          height: '1.5rem',
          width: '1.5rem',
        },
      }}
      onClick={() => props.signInFunction(props.provider.providerInstance)}
    >
      <Icon />
      {`Continue with ${props.provider.name}`}
    </Button>
  );
}