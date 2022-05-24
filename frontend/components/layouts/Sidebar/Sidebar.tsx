import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ComponentProps } from 'react';

import { Badge } from '@/components/lib/Badge';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSelectedProject } from '@/hooks/selected-project';
import { logOut } from '@/utils/auth';

import { Logo } from './Logo';
import * as S from './styles';

type Props = ComponentProps<typeof S.Root>;

interface Page {
  display: string;
  icon: string;
  route: string;
  routeMatchPattern?: string;
  debug?: boolean;
}

function useProjectPages(): Page[] {
  const pages = [];

  const { project } = useSelectedProject({
    enforceSelectedProject: false,
  });

  if (project?.tutorial === 'NFT_MARKET') {
    pages.push({
      display: 'Tutorial',
      route: '/tutorials/nfts/introduction',
      routeMatchPattern: '/tutorials/',
      icon: 'book',
    });
  }

  pages.push({ display: 'Analytics', route: '/project-analytics', icon: 'bar-chart-2' });
  pages.push({ display: 'Contracts', route: `/contracts`, icon: 'zap' });
  pages.push({ display: 'Deploys', route: '', icon: 'git-merge' });
  pages.push({ display: 'Alerts', route: '', icon: 'bell' });
  pages.push({ display: 'Settings', route: `/project-settings`, icon: 'settings' });

  return pages;
}

export function Sidebar({ children, ...props }: Props) {
  const router = useRouter();
  const pages = useProjectPages();

  function isLinkSelected(page: Page): boolean {
    const matchesPattern = page.routeMatchPattern ? router.pathname.startsWith(page.routeMatchPattern) : false;
    return router.pathname === page.route || matchesPattern;
  }

  return (
    <S.Root {...props}>
      <S.Sidebar>
        <Logo />

        <S.Nav>
          {pages.map((page) => (
            <S.NavItem key={page.display}>
              {page.route ? (
                <Link href={page.route} passHref>
                  <S.NavLink selected={isLinkSelected(page)}>
                    <FeatherIcon icon={page.icon} />
                    {page.display}
                  </S.NavLink>
                </Link>
              ) : (
                <S.NavLink as="span" disabled>
                  <FeatherIcon icon={page.icon} />
                  {page.display}
                  <Badge size="small">Soon</Badge>
                </S.NavLink>
              )}
            </S.NavItem>
          ))}
        </S.Nav>

        <S.Nav>
          <S.NavItem>
            <S.NavLink as="button" type="button" onClick={logOut}>
              <FeatherIcon icon="log-out" /> Logout
            </S.NavLink>
          </S.NavItem>
          <S.NavItem>
            <ThemeToggle />
          </S.NavItem>
        </S.Nav>
      </S.Sidebar>

      {children}
    </S.Root>
  );
}
