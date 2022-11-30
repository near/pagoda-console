import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { UserFullDropdown } from '@/components/layouts/UserFullDropdown';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { H4 } from '@/components/lib/Heading';

import { Footer } from '../Footer';
import * as S from './styles';

export const OrganizationsLayout = ({ children }: { children: ReactElement }) => {
  return (
    <S.Wrapper>
      <S.Header>
        <S.Title>
          <Link href="/projects" passHref>
            <S.BackLink>
              <FeatherIcon size="m" icon="arrow-left" color="primary" css={{ cursor: 'pointer' }} />
              <VisuallyHidden>Back to Projects</VisuallyHidden>
            </S.BackLink>
          </Link>

          <H4>Organizations</H4>
        </S.Title>

        <S.Controls>
          <UserFullDropdown />
        </S.Controls>
      </S.Header>

      <S.Main>{children}</S.Main>

      <Footer />
    </S.Wrapper>
  );
};
