import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { ButtonLink } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H3 } from '@/components/lib/Heading';
import { UserFullDropdown } from '@/components/lib/UserFullDropdown';

import { Footer } from '../Footer';
import * as S from './styles';

export const OrganizationsLayout = ({ children }: { children: ReactElement }) => {
  const router = useRouter();
  const back = useCallback(() => router.back(), [router]);

  return (
    <S.Wrapper>
      <S.Header>
        <Flex align="center" justify="spaceBetween">
          <S.Title>
            <FeatherIcon
              size="m"
              icon="arrow-left"
              onClick={back}
              css={{ cursor: 'pointer', color: 'var(--color-cta-primary)' }}
            />

            <H3>Organizations</H3>
          </S.Title>

          <S.Controls>
            <Link href="/organizations/create" passHref>
              <ButtonLink>New Organization</ButtonLink>
            </Link>
            <UserFullDropdown />
          </S.Controls>
        </Flex>
      </S.Header>

      <S.Main>{children}</S.Main>

      <Footer />
    </S.Wrapper>
  );
};
