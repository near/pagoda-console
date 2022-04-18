import Link from 'next/link';
import type { ReactElement } from 'react';

import { useRouteParam } from '@/utils/hooks';

export function Anchor(props: any) {
  const project = useRouteParam('project');

  // External links should open a new tab.
  const isExternal = props.href.startsWith('http');
  if (isExternal) {
    return (
      <a href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }

  let path;
  if (props.href.startsWith('#')) {
    path = props.href;
  } else {
    // Internal links should include project and environment.
    const splitUrl = props.href.split('#');
    const anchor = splitUrl[1] ? '#' + splitUrl[1] : '';
    path = `${splitUrl[0]}?project=${project}&environment=1${anchor}`;
  }

  return (
    <>
      {path.startsWith('#') && <a href={path}>{props.children}</a>}
      {!path.startsWith('#') && (
        <Link href={path}>
          <a>{props.children}</a>
        </Link>
      )}
    </>
  );
}

export function H1Anchor(props: any) {
  return (
    <>
      <h1>{props.children}</h1>
      <style jsx>{`
        h1 {
          margin-bottom: 2rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
        }
      `}</style>
    </>
  );
}

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

export function H2Anchor(props: any) {
  const anchor = getAnchor(props.children);

  return (
    <>
      <h2>
        {props.children}{' '}
        <a id={anchor} href={'#' + anchor} title="Direct link to heading">
          #
        </a>
      </h2>
      <style jsx>{`
        h2 {
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }
        h2 a {
          visibility: hidden;
          text-decoration: none;
        }
        h2:hover a {
          visibility: visible;
        }
      `}</style>
    </>
  );
}

export function H3Anchor(props: any) {
  const anchor = getAnchor(props.children);

  return (
    <>
      <h3>
        {props.children}{' '}
        <a id={anchor} href={'#' + anchor} title="Direct link to heading">
          #
        </a>
      </h3>
      <style jsx>{`
        h3 {
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }
        h3 a {
          visibility: hidden;
          text-decoration: none;
        }
        h3:hover a {
          visibility: visible;
        }
      `}</style>
    </>
  );
}
