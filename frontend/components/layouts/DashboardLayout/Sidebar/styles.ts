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
  background: 'var(--color-surface-1)',
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  boxShadow: 'var(--shadow-softer)',
  transition: 'width var(--animation-speed) ease',
});

export const LogoContainer = styled('div', {
  display: 'flex',
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

export const CollapseButton = styled('button', {
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
  transition: 'left var(--animation-speed) ease',

  svg: {
    transition: 'transform var(--animation-speed)',
  },

  '&:hover': {
    background: 'var(--color-cta-primary-highlight)',
  },

  '&:focus': {
    outline: 'var(--focus-outline)',
    outlineOffset: 'var(--focus-outline-offset)',
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
});

export const Root = styled('div', {
  '--animation-speed': '300ms',
  '--sidebar-width': 'var(--size-sidebar-width-expanded)',
  height: '100%',
  paddingLeft: 'var(--size-sidebar-width-expanded)',
  transition: 'padding-left var(--animation-speed) ease',

  variants: {
    sidebarCollapsed: {
      true: {
        '--sidebar-width': 'var(--size-sidebar-width-collapsed)',
        paddingLeft: 'var(--sidebar-width)',

        [`${NavLinkLabel}`]: {
          display: 'none',
        },
      },
    },

    sidebarHoverExpand: {
      true: {
        paddingLeft: 'var(--size-sidebar-width-collapsed)',

        [`${Sidebar}`]: {
          boxShadow: ' 0 2px 20px rgba(0, 0, 0, 0.5)',
        },
      },
    },
  },

  compoundVariants: [
    {
      sidebarCollapsed: true,
      sidebarHoverExpand: false,
      css: {
        [`${CollapseButton}`]: {
          '[data-collapse-icon]': {
            transform: 'rotate(180deg)',
          },
        },
      },
    },
    {
      sidebarCollapsed: false,
      sidebarHoverExpand: true,
      css: {
        [`${CollapseButton}`]: {
          '[data-collapse-icon]': {
            transform: 'rotate(180deg)',
          },
        },
      },
    },
  ],
});
