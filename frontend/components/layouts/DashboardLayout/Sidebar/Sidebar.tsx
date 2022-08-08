import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ComponentProps } from 'react';

import { Badge } from '@/components/lib/Badge';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import useFeatureFlag from '@/hooks/features';
import { useSelectedProject } from '@/hooks/selected-project';
import alertsEntries from '@/modules/alerts/sidebar-entries';
import { ThemeToggle } from '@/modules/core/components/ThemeToggle';
import indexersEntries from '@/modules/indexers/sidebar-entries';
import type { SidebarEntry } from '@/shared/utils/types';
import { logOut } from '@/utils/auth';

import { Logo } from './Logo';
import * as S from './styles';

type Props = ComponentProps<typeof S.Root>;

function useProjectPages(): SidebarEntry[] {
  const pages: SidebarEntry[] = [];

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

  // pushed individually so that module pages can be placed at any point
  pages.push({ display: 'Contracts', route: `/contracts`, icon: 'zap' });
  if (useFeatureFlag('momentary-alerts-enabled')) {
    pages.push(...alertsEntries);
  }
  pages.push({ display: 'Analytics', route: '/project-analytics', icon: 'bar-chart-2' });
  pages.push(...indexersEntries);
  pages.push({ display: 'Deploys', route: '', icon: 'git-merge' });
  pages.push({ display: 'Settings', route: `/project-settings`, icon: 'settings' });

  return pages;
}

export function Sidebar({ children, ...props }: Props) {
  const router = useRouter();
  const pages = useProjectPages();

  function isLinkSelected(page: SidebarEntry): boolean {
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
                    {page.badgeText ? <Badge size="s">{page.badgeText}</Badge> : <></>}
                  </S.NavLink>
                </Link>
              ) : (
                <S.NavLink as="span" disabled>
                  <FeatherIcon icon={page.icon} />
                  {page.display}
                  <Badge size="s">Soon</Badge>
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
