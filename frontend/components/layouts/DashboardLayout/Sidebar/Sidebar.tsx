import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ComponentProps, TouchEvent } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Tooltip } from '@/components/lib/Tooltip';
import { useAuth, useSignOut } from '@/hooks/auth';
import { usePublicMode } from '@/hooks/public';
import { useSelectedProject } from '@/hooks/selected-project';
import alertsEntries from '@/modules/alerts/sidebar-entries';
import apisEntries from '@/modules/apis/sidebar-entries';
import contractsEntries from '@/modules/contracts/sidebar-entries';
import { ThemeToggle } from '@/modules/core/components/ThemeToggle';
import indexersEntries from '@/modules/indexers/sidebar-entries';
import { StableId } from '@/utils/stable-ids';

import { Logo } from './Logo';
import * as S from './styles';
import type { SidebarEntry } from './types';

type Props = ComponentProps<typeof S.Root>;

function useProjectPages(): SidebarEntry[] {
  const { publicModeIsActive } = usePublicMode();
  const { authStatus } = useAuth();
  let pages: SidebarEntry[] = [];

  const { project } = useSelectedProject({
    enforceSelectedProject: false,
  });

  if (project?.tutorial === 'NFT_MARKET') {
    pages.push({
      display: 'Tutorial',
      route: '/tutorials/nfts/introduction',
      routeMatchPattern: '/tutorials/',
      icon: 'book',
      stableId: StableId.SIDEBAR_TUTORIAL_LINK,
    });
  }

  pages.push(...apisEntries);
  pages.push(...alertsEntries);
  pages.push(...contractsEntries);

  pages.push({
    display: 'Analytics',
    route: '/project-analytics',
    icon: 'bar-chart-2',
    stableId: StableId.SIDEBAR_ANALYTICS_LINK,
    visibleForAuthPublicMode: true,
  });

  pages.push(...indexersEntries);

  if (authStatus === 'AUTHENTICATED') {
    pages.push({
      display: 'Settings',
      route: '/project-settings',
      icon: 'settings',
      stableId: StableId.SIDEBAR_PROJECT_SETTINGS_LINK,
    });
  }

  if (authStatus === 'AUTHENTICATED' && publicModeIsActive) {
    pages = pages.filter((page) => page.visibleForAuthPublicMode);
  }

  return pages;
}

export function Sidebar({ children, ...props }: Props) {
  const router = useRouter();
  const pages = useProjectPages();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean | undefined>(undefined);
  const sidebarCollapseToggleLabel = sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar';
  const signOut = useSignOut();
  const { authStatus } = useAuth();
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 960;

  useEffect(() => {
    if (sidebarCollapsed === undefined) {
      if (isSmallScreen) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
      }
    }

    if (!sidebarCollapsed) {
      document.body.classList.add('sidebar-expanded');

      if (isSmallScreen) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.classList.remove('sidebar-expanded');
      document.body.style.overflow = '';
    }

    return () => {
      document.body.classList.remove('sidebar-expanded');
      document.body.style.overflow = '';
    };
  }, [isSmallScreen, sidebarCollapsed]);

  function clickHandler() {
    if (isSmallScreen && !sidebarCollapsed) {
      toggleCollapsed();
    }
  }

  function isLinkSelected(page: SidebarEntry): boolean {
    const matchesPattern = page.routeMatchPattern ? router.pathname.startsWith(page.routeMatchPattern) : false;
    return router.pathname === page.route || matchesPattern;
  }

  function logoTouchHandler(event: TouchEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleCollapsed();
  }

  function toggleCollapsed() {
    localStorage.setItem('sidebarCollapsed', `${!sidebarCollapsed}`);
    setSidebarCollapsed(!sidebarCollapsed);
  }

  if (sidebarCollapsed === undefined) {
    return null;
  }

  return (
    <S.Root {...props} sidebarCollapsed={sidebarCollapsed} onClick={clickHandler}>
      <S.Sidebar ref={sidebarRef}>
        <Tooltip content={sidebarCollapseToggleLabel} side="right" sideOffset={20} disabledTouchScreen>
          <S.LogoWrapper
            type="button"
            aria-label={sidebarCollapseToggleLabel}
            onClick={toggleCollapsed}
            onTouchEnd={logoTouchHandler}
          >
            <Logo collapsed={sidebarCollapsed} />
            <S.CollapseIcon>
              <FeatherIcon icon={'chevron-left'} color="ctaPrimaryText" />
            </S.CollapseIcon>
          </S.LogoWrapper>
        </Tooltip>

        <S.Nav>
          {pages.map((page) => (
            <Tooltip
              key={page.display}
              content={page.display}
              side="right"
              disabled={!sidebarCollapsed}
              disabledTouchScreen
            >
              <S.NavItem>
                {page.route ? (
                  <Link href={page.route} passHref>
                    <S.NavLink selected={isLinkSelected(page)} data-stable-id={page.stableId}>
                      <FeatherIcon icon={page.icon} />
                      <S.NavLinkLabel>
                        {page.display}
                        {page.badgeText ? <Badge size="s">{page.badgeText}</Badge> : <></>}
                      </S.NavLinkLabel>
                    </S.NavLink>
                  </Link>
                ) : (
                  <S.NavLink as="span" disabled>
                    <FeatherIcon icon={page.icon} />
                    <S.NavLinkLabel>
                      {page.display}
                      {<Badge size="s">Soon</Badge>}
                    </S.NavLinkLabel>
                  </S.NavLink>
                )}
              </S.NavItem>
            </Tooltip>
          ))}
        </S.Nav>

        <S.Nav>
          {authStatus === 'AUTHENTICATED' && (
            <Tooltip content="Log Out" side="right" disabled={!sidebarCollapsed} disabledTouchScreen>
              <S.NavItem>
                <S.NavLink as="button" type="button" onClick={signOut}>
                  <FeatherIcon icon="log-out" />
                  <S.NavLinkLabel>Logout</S.NavLinkLabel>
                </S.NavLink>
              </S.NavItem>
            </Tooltip>
          )}

          <Tooltip content="Toggle Dark Mode" side="right" disabled={!sidebarCollapsed} disabledTouchScreen>
            <S.NavItem>
              <ThemeToggle collapsed={sidebarCollapsed} />
            </S.NavItem>
          </Tooltip>
        </S.Nav>
      </S.Sidebar>

      {children}
    </S.Root>
  );
}
