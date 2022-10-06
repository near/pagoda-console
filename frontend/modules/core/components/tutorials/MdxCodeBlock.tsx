import type { Dispatch, SetStateAction } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import { Box } from '@/components/lib/Box';
import { CodeBlock } from '@/components/lib/CodeBlock';
import { TextLink } from '@/components/lib/TextLink';
import { StableId } from '@/utils/stable-ids';

export interface GitHubReference {
  url: string;
  fromLine: number;
  toLine: number;
  title: string;
}

export default function MdxCodeBlock(props: any) {
  const [content, setContent] = useState('');
  const lastFetchedUrl = useRef('');

  // className is the language used in the code block.
  // It's currently the only way for us to guess if the .mdx is using a single tick (`) vs three ticks (```).
  // Another way around this would be to call the component directly in Markdown.
  useEffect(() => {
    if (!isGithubReference(props)) {
      return;
    }

    const url = props.children;

    if (url !== lastFetchedUrl.current) {
      // Render the github content in OtherCodeBlock
      const codeSnippetDetails = parseReference(url);
      // This isn't getting the line numbers correctly.
      fetchCode(codeSnippetDetails, setContent);
      lastFetchedUrl.current = url;
    }
  }, [props]);

  if (isGithubReference(props)) {
    // Handles "```rust reference" code blocks
    return (
      <>
        <CodeBlock language={props.className.replace('language-', '')}>{content}</CodeBlock>
        <Box css={{ paddingTop: 'var(--space-s)', textAlign: 'center' }}>
          <TextLink
            stableId={StableId.TUTORIAL_CONTENT_CODE_BLOCK_GITHUB_LINK}
            color="neutral"
            target="_blank"
            rel="noreferrer"
            css={{ fontWeight: 400 }}
          >
            See full example on Github
          </TextLink>
        </Box>
      </>
    );
  } else if (props.className) {
    // Handle code blocks with a language set.
    return (
      <>
        <div className="codeWrapper">
          <CodeBlock language={props.className.replace('language-', '')}>{props.children.slice(0, -1)}</CodeBlock>
        </div>
      </>
    );
  } else if (props.children.split('\n').length > 1) {
    // Handles code blocks without a language specified but has multiple lines.
    return (
      <>
        <div className="codeWrapper">
          <CodeBlock language="text">{props.children.slice(0, -1)}</CodeBlock>
        </div>
      </>
    );
  }
  // Single tick code blocks that do not require a whole highlight block.
  return (
    <>
      <Box
        as="code"
        css={{
          borderRadius: '0.4rem',
          border: 'none',
          background: 'var(--color-surface-1)',
          padding: '0.1rem 0.3rem',
          margin: '0.1rem',
          fontSize: '0.875em',
          color: '#e43b8f',
          wordWrap: 'break-word',
          fontFamily: 'var(--font-code)',
        }}
      >
        {props.children}
      </Box>
    </>
  );
}

function isGithubReference(props: any) {
  return props.className === 'language-rust' && props.children.startsWith('https://github.com/near-examples');
}

// Similar to what near/docs are doing with this docusaurus theme: https://github.com/saucelabs/docusaurus-theme-github-codeblock#readme
export function parseReference(ref: string): GitHubReference {
  const fullUrl = ref.slice(ref.indexOf('https'), -1);
  const [url, loc] = fullUrl.split('#');

  const [org, repo, _blob, branch, ...pathSeg] = new URL(url).pathname.split('/').slice(1);
  const [fromLine, toLine] = loc ? loc.split('-').map((lineNr) => parseInt(lineNr.slice(1), 10) - 1) : [0, Infinity];

  return {
    url: `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${pathSeg.join('/')}`,
    fromLine,
    toLine,
    title: pathSeg.join('/'),
  };
}

// Similar to what near/docs are doing with this docusaurus theme: https://github.com/saucelabs/docusaurus-theme-github-codeblock#readme
async function fetchCode({ url, fromLine, toLine }: GitHubReference, setContent: Dispatch<SetStateAction<string>>) {
  let res: Response;

  try {
    res = await fetch(url);
  } catch (err) {
    return setContent('error loading snippet');
  }

  if (res.status !== 200) {
    // const error = await res.text();
    return setContent('error loading snippet');
  }

  const body = (await res.text()).split('\n').slice(fromLine, (toLine || fromLine) + 1);

  const preceedingSpace = body.reduce((prev: number, line: string) => {
    if (line.length === 0) {
      return prev;
    }

    const spaces = line.match(/^\s+/);
    if (spaces) {
      return Math.min(prev, spaces[0].length);
    }

    return 0;
  }, Infinity);

  const content = body.map((line) => line.slice(preceedingSpace)).join('\n');
  setContent(content);
}
