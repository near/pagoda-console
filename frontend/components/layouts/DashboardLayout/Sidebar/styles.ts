import { styled } from '@/styles/stitches';

export const Root = styled('div', {
  height: '100%',
  paddingLeft: 'var(--size-sidebar-width-expanded)',
});

export const Sidebar = styled('nav', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 'var(--space-l)',
  width: 'var(--size-sidebar-width-expanded)',
  position: 'fixed',
  zIndex: 500,
  top: 0,
  left: 0,
  bottom: 0,
  padding: '0 var(--space-m) var(--space-m)',
  background: 'var(--color-surface-1)',
  overflow: 'auto',
  scrollBehavior: 'smooth',
});

export const LogoContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  height: 'var(--size-header-height)',
  padding: '0 var(--space-s)',
});

export const Nav = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-m)',
});

export const NavItem = styled('li', {
  display: 'block',
});

export const NavLink = styled('a', {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: 'var(--space-s)',
  fontSize: 'var(--font-size-h6)',
  lineHeight: 'var(--line-height-h6)',
  fontWeight: 400,
  color: 'var(--color-text-1)',
  cursor: 'pointer',
  padding: 'var(--space-s)',
  borderRadius: 'var(--border-radius-s)',
  transition: 'var(--transitions)',

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
