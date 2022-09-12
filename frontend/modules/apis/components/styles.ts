import { styled } from '@/styles/stitches';

export const Root = styled('div', {
  'div.sl-px-24.sl-overflow-y-auto': {
    // increase the width by decreasing padding
    paddingLeft: '80px',
    paddingRight: '20px',
    minWidth: '800px',
  },
  'div.sl-elements-api': {
    // positioning the elements web component
    marginLeft: '-16px',
    marginTop: '10px',
  },
  'div.sl-stack.sl-stack--horizontal.sl-stack--5.sl-flex.sl-flex-row.sl-items-center + div': {
    // path of request under title
    backgroundColor: 'var(--color-surface-1)',
    borderRadius: 'var(--border-radius-s)',
  },
  'div.sl-bg-success.sl-text-on-primary': {
    // GET in path has fixed width
    width: '55px',
    color: 'var(--color-cta-primary-text)',
  },
  '.sl-py-16': {
    // align right panel with sidebar title
    paddingTop: '28px !important',
  },
  'h4.sl-text-paragraph, div.sl-stack, div.sl-elements, div.sl-prose > p, span.sl-text-muted': {
    // light grey font
    color: 'var(--color-text-2)',
  },
  '.sl-prose ul:not(.contains-task-list) li:before': {
    backgroundColor: 'var(--color-primary) !important',
  },
  'div.sl-bg-primary-tint': {
    // navbar active element
    backgroundColor: 'var(--color-primary) !important',
    color: 'var(--color-cta-primary-text) !important',
    borderRadius: 'var(--border-radius-s)',
    margin: '0 10px',
  },
  '.sl-cursor-pointer ~ .sl-text-success': {
    color: 'var(--color-cta-primary-text)',
  },
  'div.sl-select-none': {
    // navbar non active elements with dropdown
    '&:hover': {
      color: 'var(--color-cta-primary)',
      backgroundColor: 'var(--color-surface-3)',
    },
  },
  'a.ElementsTableOfContentsItem > div': {
    // navbar non active elements without dropdown
    '&:hover': {
      color: 'var(--color-cta-primary)',
      backgroundColor: 'var(--color-surface-3)',
    },
  },
  'div.sl-elements-api > div, div.sl-bg-canvas-100': {
    backgroundColor: 'var(--color-surface-3)',
  },
  'div.sl-panel > div.sl-panel__content-wrapper': {
    backgroundColor: 'var(--color-surface-1)',
  },
  // Overview Page
  'div.sl-panel__content-wrapper > div': {
    // API Base Url on Overview page
    backgroundColor: 'var(--color-surface-1)',
  },
  'div.sl-panel.sl-border': {
    // Security: API Key box
    border: 'none',
  },
  'span.sl-badge': {
    backgroundColor: 'var(--color-surface-5) !important',
    border: 'none',
    padding: '0 10px',
  },
  //
  'div.sl-bg-canvas-100 > div.OperationParametersContent, .ParameterGrid': {
    // background color for API playground
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-2)',
  },
  'div.SendButtonHolder': {
    // background color for API playground
    backgroundColor: 'var(--color-surface-1)',
    '* > button': {
      color: 'var(--color-cta-primary-text) !important',
      backgroundColor: 'var(--color-primary-highlight) !important',
      borderRadius: 'var(--border-radius-s) !important',
      '&:hover': {
        backgroundColor: 'var(--color-primary) !important',
      },
    },
  },
  'div.TryItPanel.sl-bg-canvas-100': {
    // dark color for API playground
    backgroundColor: 'var(--color-surface-1)',
  },

  // everything below adjusts styling for code blocks and the req/res examples

  'div.sl-panel > div.sl-panel__titlebar': {
    color: 'var(--color-cta-primary-text)',
    backgroundColor: 'var(--color-cta-primary)',
    '&:hover': {
      color: 'var(--color-surface-3)',
      backgroundColor: 'var(--color-cta-primary)',
    },
  },
  'div.sl-code-highlight': {
    backgroundColor: 'white',
    overflowY: 'inherit',
  },
  'div.sl-code-highlight .sl-flex .token.punctuation': {
    color: 'rgb(51, 51, 51) !important',
  },
  'div.sl-code-highlight .sl-flex .token.property': {
    color: 'rgb(24, 54, 145) !important',
  },
  'div.sl-code-highlight .sl-flex .token.string': {
    color: 'rgb(3, 47, 98) !important',
  },
  'svg.sl-icon': {
    maxHeight: '18px',
  },
  'div.sl-panel ~ button.sl-button': {
    // request panel
    '&:hover': {
      color: 'var(--color-text-1) !important',
      backgroundColor: 'var(--color-surface-1) !important',
    },
  },
  '[aria-label=Export]': {
    // button that opens dropdown menu for Export
    color: 'var(--color-text-1) !important',
    backgroundColor: 'var(--color-surface-2) !important',
    borderRadius: 'var(--border-radius-xs) !important',
    border: '1px solid var(--color-border-2) !important',
    '&:hover': {
      backgroundColor: 'var(--color-surface-1) !important',
      color: 'var(--color-text-1) !important',
    },
  },
  'button.sl-button': {
    // button that opens dropdown menu for code blocks
    color: 'var(--color-surface-1)',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-xs)',
    '&:hover': {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-surface-3)',
    },
  },
  'div.sl-menu--pointer-interactions': {
    // dropdown menu elements
    backgroundColor: 'var(--color-surface-overlay) !important',
    borderRadius: 'var(--border-radius-s) !important',
    '& > div': {
      color: 'var(--color-text-1)',
      backgroundColor: 'var(--color-surface-overlay)',
      margin: '0 8px',
      borderRadius: 'var(--border-radius-s)',
      '&:hover': {
        margin: '0 8px',
        cursor: 'pointer',
        backgroundColor: 'var(--color-surface-2) !important',
        color: 'var(--color-text-1) !important',
      },
    },
  },
  'svg.fa-caret-up, svg.fa-caret-down': {
    // dropdown menu's carat
    color: 'var(--color-surface-overlay)',
  },
  'code.sl-text-on-code': {
    backgroundColor: 'var(--color-surface-5) !important',
    borderColor: 'var(--color-surface-5) !important',
    borderRadius: 'var(--border-radius-s) !important',
  },
  '.sl-panel__content-wrapper.sl-border-t > div': {
    // API documentation message
    backgroundColor: 'var(--color-surface-1)',
  },
  '.token.plain': {
    // ensures the curl command is black on both themes
    color: 'var(--color-cta-primary-text)',
  },
  '.sl-stack--horizontal > .sl-bg-success': {
    // REST request in curl route
    backgroundColor: 'var(--color-primary-highlight)',
    color: 'var(--color-cta-primary-text)',
  },
});
