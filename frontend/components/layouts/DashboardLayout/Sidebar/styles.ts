import { styled } from '@/styles/stitches';

export const Sidebar = styled('nav', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 'var(--space-l)',
  width: 'var(--sidebar-width)',
  position: 'fixed',
  zIndex: 'var(--sidebar-z-index)',
  top: 0,
  left: 0,
  bottom: 0,
  padding: '0 var(--space-m) var(--space-m)',
  background: 'var(--color-surface-2)',
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  boxShadow: 'var(--shadow-softer)',
  transition: 'width var(--sidebar-animation-speed) ease',
});

export const LogoWrapper = styled('button', {
  cursor: 'pointer',
  margin: '0 calc(var(--space-m) * -1)',
  padding: '0 var(--space-m)',
});

export const Logo = styled('span', {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  height: 'var(--size-header-height)',
  padding: '0 0.35rem',
  flexShrink: 0,
});

export const Nav = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-m)',
});

export const NavItem = styled('li', {
  display: 'block',
});

export const CollapseIcon = styled('span', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  background: 'var(--color-cta-primary)',
  borderRadius: '50%',
  boxShadow: 'var(--shadow-soft)',
  width: '1.5rem',
  height: '1.5rem',
  position: 'fixed',
  left: 'calc(var(--sidebar-width) - 0.75rem)',
  top: '1.15rem',
  transition: 'left var(--sidebar-animation-speed) ease',

  svg: {
    transition: 'transform var(--sidebar-animation-speed)',
  },

  '&:hover': {
    background: 'var(--color-cta-primary-highlight)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  '@tablet': {
    width: '1rem',
    height: '1rem',
    top: '1.35rem',
    left: 'calc(var(--sidebar-width) - 0.5rem)',

    svg: {
      width: '0.7rem',
      height: '0.7rem',
    },
  },
});

export const NavLink = styled('a', {
  display: 'flex',
  width: '100%',
  height: '2.5rem',
  alignItems: 'center',
  gap: 'var(--space-s)',
  fontFamily: 'var(--font-action)',
  fontSize: 'var(--font-size-body-small)',
  lineHeight: 'var(--line-height-body-small)',
  fontWeight: 500,
  color: 'var(--color-text-1)',
  cursor: 'pointer',
  padding: 'var(--space-s)',
  borderRadius: 'var(--border-radius-s)',
  transition: 'var(--transitions)',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',

  '&:hover': {
    color: 'var(--color-cta-primary)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
  },

  variants: {
    disabled: {
      true: {
        color: 'var(--color-text-3)',
        pointerEvents: 'none',
      },
    },
    selected: {
      true: {
        background: 'var(--color-cta-primary) !important',
        color: 'var(--color-cta-primary-text) !important',
      },
    },
  },
});

export const NavLinkLabel = styled('span', {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-s)',
  whiteSpace: 'nowrap',
});

export const Root = styled('div', {
  '--sidebar-width': 'var(--size-sidebar-width-expanded)',
  height: '100%',
  paddingLeft: 'var(--size-sidebar-width-expanded)',
  transition: 'padding-left var(--sidebar-animation-speed) ease',

  '@tablet': {
    paddingLeft: 0,
    '--sidebar-width': '100vw',
  },

  variants: {
    sidebarCollapsed: {
      true: {
        '--sidebar-width': 'var(--size-sidebar-width-collapsed)',
        paddingLeft: 'var(--sidebar-width)',

        [`${NavLinkLabel}`]: {
          display: 'none',
        },

        [`${CollapseIcon}`]: {
          svg: {
            transform: 'rotate(180deg)',
          },
        },

        '@tablet': {
          paddingLeft: 0,

          [`${Sidebar}`]: {
            height: 'var(--size-header-height)',
            overflow: 'hidden',
          },
        },
      },

      false: {
        '@tablet': {
          [`${CollapseIcon}`]: {
            left: 'calc(var(--sidebar-width) - 2.5rem)',
          },
        },
      },
    },
  },
});
