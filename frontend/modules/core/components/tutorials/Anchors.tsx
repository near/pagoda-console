import Link from 'next/link';
import type { ReactElement } from 'react';

import { H1, H2, H3 } from '@/components/lib/Heading';
import { TextLink } from '@/components/lib/TextLink';

function getAnchor(el: ReactElement | string): string {
  if (typeof el === 'string') {
    // This replacement is trying to mimic the behavior of hash urls in docusaurus on docs.near.org.
    return el.toLowerCase().split('.').join('').split("'").join('').split(' ').join('-');
  }

  if (el.props) {
    return getAnchor(el.props.children);
  }

  return '';
}

export function Anchor(props: any) {
  // External links should open a new tab.
  const isExternal = props.href.startsWith('http');
  if (isExternal) {
    return (
      <TextLink href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </TextLink>
    );
  }

  const path = props.href;

  return (
    <>
      {path.startsWith('#') && <TextLink href={path}>{props.children}</TextLink>}
      {!path.startsWith('#') && (
        <Link href={path} passHref>
          <TextLink>{props.children}</TextLink>
        </Link>
      )}
    </>
  );
}

export function H1Anchor(props: any) {
  return <H1 css={{ marginBottom: '2rem' }}>{props.children}</H1>;
}

export function H2Anchor(props: any) {
  const anchor = getAnchor(props.children);

  return (
    <H2
      css={{
        marginTop: '2rem',
        a: {
          visibility: 'hidden',
          textDecoration: 'none',
        },
        '&:hover a': {
          visibility: 'visible',
        },
      }}
    >
      {props.children}{' '}
      <a id={anchor} href={'#' + anchor} title="Direct link to heading">
        #
      </a>
    </H2>
  );
}

export function H3Anchor(props: any) {
  const anchor = getAnchor(props.children);

  return (
    <H3
      css={{
        marginTop: '2rem',
        a: {
          visibility: 'hidden',
          textDecoration: 'none',
        },
        '&:hover a': {
          visibility: 'visible',
        },
      }}
    >
      {props.children}{' '}
      <a id={anchor} href={'#' + anchor} title="Direct link to heading">
        #
      </a>
    </H3>
  );
}
