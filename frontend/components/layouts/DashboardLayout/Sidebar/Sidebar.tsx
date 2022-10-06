import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Tooltip } from '@/components/lib/Tooltip';
import useFeatureFlag from '@/hooks/features';
import { useSelectedProject } from '@/hooks/selected-project';
import alertsEntries from '@/modules/alerts/sidebar-entries';
import apisEntries from '@/modules/apis/sidebar-entries';
import contractsEntries from '@/modules/contracts/sidebar-entries';
import { ThemeToggle } from '@/modules/core/components/ThemeToggle';
import indexersEntries from '@/modules/indexers/sidebar-entries';
import type { SidebarEntry } from '@/shared/utils/types';
import { logOut } from '@/utils/auth';
import { StableId } from '@/utils/stable-ids';

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
      stableId: StableId.SIDEBAR_TUTORIAL_LINK,
    });
  }

  // pushed individually so that module pages can be placed at any point
  pages.push(...apisEntries);
  if (useFeatureFlag('momentary-alerts-enabled')) {
    pages.push(...alertsEntries);
  }
  pages.push(...contractsEntries);
  pages.push({
    display: 'Analytics',
    route: '/project-analytics',
    icon: 'bar-chart-2',
    stableId: StableId.SIDEBAR_ANALYTICS_LINK,
  });
  pages.push(...indexersEntries);
  pages.push({
    display: 'Settings',
    route: '/project-settings',
    icon: 'settings',
    stableId: StableId.SIDEBAR_PROJECT_SETTINGS_LINK,
  });

  return pages;
}

export function Sidebar({ children, ...props }: Props) {
  const router = useRouter();
  const pages = useProjectPages();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean | undefined>(undefined);
  const [sidebarHoverExpand, setSidebarHoverExpand] = useState(false);
  const [sidebarCollapseButtonHover, setSidebarCollapseButtonHover] = useState(false);
  const sidebarCollapseToggleLabel = sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar';

  useEffect(() => {
    if (sidebarCollapsed === undefined) {
      setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    }
  }, [sidebarCollapsed]);

  function isLinkSelected(page: SidebarEntry): boolean {
    const matchesPattern = page.routeMatchPattern ? router.pathname.startsWith(page.routeMatchPattern) : false;
    return router.pathname === page.route || matchesPattern;
  }

  function toggleCollapsed() {
    localStorage.setItem('sidebarCollapsed', `${!sidebarCollapsed}`);
    setSidebarCollapsed(!sidebarCollapsed);
    setSidebarHoverExpand(false);
  }

  function sidebarMouseMoveHandler() {
    if (sidebarCollapsed && !sidebarCollapseButtonHover) {
      setSidebarHoverExpand(true);
    }
  }

  function sidebarMouseLeaveHandler() {
    setSidebarHoverExpand(false);
  }

  if (sidebarCollapsed === undefined) {
    return null;
  }

  return (
    <S.Root
      {...props}
      sidebarCollapsed={sidebarCollapsed && !sidebarHoverExpand}
      sidebarHoverExpand={sidebarHoverExpand}
    >
      <S.Sidebar onMouseMove={sidebarMouseMoveHandler} onMouseLeave={sidebarMouseLeaveHandler}>
        <Logo collapsed={sidebarCollapsed && !sidebarHoverExpand} />

        <Tooltip content={sidebarCollapseToggleLabel}>
          <S.CollapseButton
            type="button"
            aria-label={sidebarCollapseToggleLabel}
            onClick={toggleCollapsed}
            onMouseEnter={() => setSidebarCollapseButtonHover(true)}
            onMouseLeave={() => setSidebarCollapseButtonHover(false)}
          >
            <FeatherIcon icon={'chevron-left'} color="ctaPrimaryText" data-collapse-icon />
          </S.CollapseButton>
        </Tooltip>

        <S.Nav>
          {pages.map((page) => (
            <S.NavItem key={page.display}>
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
          ))}
        </S.Nav>

        <S.Nav>
          <S.NavItem>
            <S.NavLink as="button" type="button" onClick={logOut}>
              <FeatherIcon icon="log-out" />
              <S.NavLinkLabel>Logout</S.NavLinkLabel>
            </S.NavLink>
          </S.NavItem>
          <S.NavItem>
            <ThemeToggle collapsed={sidebarCollapsed && !sidebarHoverExpand} />
          </S.NavItem>
        </S.Nav>
      </S.Sidebar>

      {children}
    </S.Root>
  );
}
