import type { ComponentProps } from '@stitches/react';
import Link from 'next/link';

import { UserFullDropdown } from '@/components/layouts/UserFullDropdown';
import { ButtonLink } from '@/components/lib/Button';
import { useAuth } from '@/hooks/auth';
import { usePublicMode } from '@/hooks/public';
import { StableId } from '@/utils/stable-ids';

import { PublicHeader } from './PublicHeader';
import { StandardHeader } from './StandardHeader';
import * as S from './styles';
import type { HeaderRedirect } from './types';

type Props = ComponentProps<typeof S.Header> & {
  redirect?: HeaderRedirect;
};

export function Header({ redirect, ...props }: Props) {
  const { authStatus } = useAuth();
  const { publicModeIsActive } = usePublicMode();

  return (
    <S.Header {...props}>
      {publicModeIsActive ? <PublicHeader /> : <StandardHeader redirect={redirect} />}

      {authStatus === 'AUTHENTICATED' && <UserFullDropdown />}

      {authStatus === 'UNAUTHENTICATED' && (
        <Link href="/">
          <ButtonLink
            stableId={StableId.HEADER_SIGN_IN_LINK}
            size="s"
            color="primaryBorder"
            css={{ alignSelf: 'center' }}
          >
            Sign In
          </ButtonLink>
        </Link>
      )}
    </S.Header>
  );
}
