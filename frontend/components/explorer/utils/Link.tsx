import React from 'react';

import { useNet } from '@/hooks/net';
import analytics from '@/utils/analytics';

const LinkWrapper = React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>((props, ref) => {
  const net = useNet();
  const baseUrl = `https://explorer${net === 'MAINNET' ? '' : '.testnet'}.near.org/`;
  const href = baseUrl + props.href;
  return (
    <a
      onClick={() => analytics.track('DC Explorer link', { status: 'success', net, href: props.href })}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      href={href}
      ref={ref}
    >
      {props.children}
    </a>
  );
});

LinkWrapper.displayName = 'Link';

export default LinkWrapper;
