import { useMutation } from '@tanstack/react-query';
import type { AuthError, AuthProvider, UserCredential } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
import { useCallback, useEffect, useMemo, useState } from 'react';

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
    backgroundColorHover: '#111111',
    providerInstance: new GithubAuthProvider(),
    icon: GithubIconSvg,
    stableId: StableId.AUTHENTICATION_FORM_SIGN_IN_WITH_GITHUB_BUTTON,
  },
  {
    name: 'Google',
    color: '#757575',
    backgroundColor: '#ffffff',
    backgroundColorHover: '#ededed',
    providerInstance: new GoogleAuthProvider(),
    icon: GoogleIconSvg,
    stableId: StableId.AUTHENTICATION_FORM_SIGN_IN_WITH_GOOGLE_BUTTON,
  },
];

export function AuthForm({ onSignIn }: Props) {
  const router = useRouter();
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

  const [alternativeMethods, setAlternativeMethods] = useState<string[]>([]);

  const signInViaProviderMutation = useMutation<
    UserCredential,
    unknown,
    { provider: AuthProvider; publicModeIsActive: boolean }
  >(({ provider }) => signInWithPopup(getAuth(), provider), {
    onSuccess: (result, { provider, publicModeIsActive }) => {
      const additional = getAdditionalUserInfo(result);
      if (additional?.isNewUser) {
        analytics.track(`DC Signed up with ${provider.providerId.split('.')[0].toUpperCase()}`);

        if (publicModeIsActive) {
          analytics.track(`DC Public Mode Sign Up`);
        }
      } else {
        analytics.track(`DC Login via ${provider.providerId.split('.')[0].toUpperCase()}`);
      }
    },
    onError: async (error: any) => {
      const auth = getAuth();
      const email = error?.email || error?.customData?.email;
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return setAlternativeMethods(methods);
    },
  });

  const signInViaEmailMutation = useMutation<UserCredential, AuthError, { email: string; password: string }>(
    async ({ email, password }) => {
      const auth = getAuth();
      return signInWithEmailAndPassword(auth, email, password);
    },
    {
      onSuccess: () => {
        analytics.track('DC Login using name + password', {
          status: 'success',
        });
      },
      onError: async (error) => {
        analytics.track('DC Login using name + password', {
          status: 'failure',
          error: error.code,
        });
      },
    },
  );

  const signInViaProviderError = useMemo(() => {
    if (signInViaProviderMutation.status !== 'error') {
      return null;
    }
    const error = signInViaProviderMutation.error as any;

    switch (error.code) {
      case 'auth/account-exists-with-different-credential':
        // The provider account's email address.
        const email = error?.email || error?.customData?.email;

        if (!email) {
          // Couldn't get the email for some reason.
          return 'There is already an account associated with that email.';
        } else {
          // Get sign-in methods for this email.
          return `You already have an account with the email ${email}.${
            alternativeMethods ? ` Try logging in with ${alternativeMethods.join(' or ')}.` : ''
          }`;
        }
      case 'auth/cancelled-popup-request':
      case 'auth/popup-blocked':
      case 'auth/popup-closed-by-user':
        // do nothing, these can be silent errors
        return null;

      default:
        return 'Something went wrong. Please try again';
    }
  }, [signInViaProviderMutation, alternativeMethods]);

  const socialSignIn = useCallback(
    (provider: AuthProvider) => signInViaProviderMutation.mutate({ provider, publicModeIsActive }),
    [signInViaProviderMutation, publicModeIsActive],
  );

  return (
    <Flex gap="l" stack>
      <Flex stack>
        {providers.map((provider) => (
          <ProviderButton
            key={provider.name}
            isAuthenticating={signInViaProviderMutation.isLoading || signInViaEmailMutation.isLoading}
            provider={provider}
            signInFunction={socialSignIn}
          />
        ))}
      </Flex>

      <HR />

      <EmailForm externalLoading={signInViaProviderMutation.isLoading} mutation={signInViaEmailMutation} />

      <ErrorModal error={signInViaProviderError} resetError={signInViaProviderMutation.reset} />
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
