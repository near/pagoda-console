/*
  There are rare cases that require use of useLayoutEffect() - EG: when needing to
  access a DOM element ref on component mount.

  Next JS throws a console warning when using useLayoutEffect() directly. This hook
  silences that warning. You should only use this hook as a last resort if useEffect()
  doesn't solve your requirements.

  https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85?permalink_comment_id=3570933#gistcomment-3570933
  https://medium.com/@alexandereardon/uselayouteffect-and-ssr-192986cdcf7a
*/

import { useLayoutEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const useBrowserLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : () => {};
