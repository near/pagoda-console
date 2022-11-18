import type { ComponentProps } from '@stitches/react';
import Link from 'next/link';

import { TextLink } from '@/components/lib/TextLink';
import { UserFullDropdown } from '@/components/lib/UserFullDropdown';
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
          <TextLink stableId={StableId.HEADER_SIGN_IN_LINK} css={{ marginRight: 'var(--space-m)' }}>
            Sign In
          </TextLink>
        </Link>
      )}
    </S.Header>
  );
}
