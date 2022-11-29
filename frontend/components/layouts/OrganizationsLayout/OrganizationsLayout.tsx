import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { UserFullDropdown } from '@/components/layouts/UserFullDropdown';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H3 } from '@/components/lib/Heading';

import { Footer } from '../Footer';
import * as S from './styles';

export const OrganizationsLayout = ({ children }: { children: ReactElement }) => {
  return (
    <S.Wrapper>
      <S.Header>
        <Flex align="center" justify="spaceBetween">
          <S.Title>
            <Link href="/projects" passHref>
              <a>
                <FeatherIcon size="m" icon="arrow-left" color="primary" css={{ cursor: 'pointer' }} />
                <VisuallyHidden>Back to Projects</VisuallyHidden>
              </a>
            </Link>

            <H3>Organizations</H3>
          </S.Title>

          <S.Controls>
            <UserFullDropdown />
          </S.Controls>
        </Flex>
      </S.Header>

      <S.Main>{children}</S.Main>

      <Footer />
    </S.Wrapper>
  );
};
