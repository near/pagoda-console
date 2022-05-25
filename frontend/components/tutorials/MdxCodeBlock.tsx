import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import CodeBlock from '../CodeBlock';

export interface GitHubReference {
  url: string;
  fromLine: number;
  toLine: number;
  title: string;
}

export default function MdxCodeBlock(props: any) {
  const [content, setContent] = useState('');

  // className is the language used in the code block.
  // It's currently the only way for us to guess if the .mdx is using a single tick (`) vs three ticks (```).
  // Another way around this would be to call the component directly in Markdown.
  useEffect(() => {
    if (!isGithubReference(props)) {
      return;
    }
    const url = props.children;
    // Render the github content in OtherCodeBlock
    const codeSnippetDetails = parseReference(url);
    // This isn't getting the line numbers correctly.
    fetchCode(codeSnippetDetails, setContent);
  }, [props]);

  if (isGithubReference(props)) {
    // Handles "```rust reference" code blocks
    return (
      <>
        <CodeBlock language={props.className.replace('language-', '')}>{content}</CodeBlock>
        <div className="githubLink">
          <a href={props.children.slice(0, -1)} target="_blank" rel="noreferrer">
            See full example on Github
          </a>
        </div>
        <style jsx>{`
          .githubLink {
            text-align: center;
          }
        `}</style>
      </>
    );
  } else if (props.className) {
    // Handle code blocks with a language set.
    return (
      <>
        <div className="codeWrapper">
          <CodeBlock language={props.className.replace('language-', '')}>{props.children.slice(0, -1)}</CodeBlock>
        </div>
        <style jsx>{`
          .codeWrapper {
            margin-bottom: -1rem;
          }
        `}</style>
      </>
    );
  } else if (props.children.split('\n').length > 1) {
    // Handles code blocks without a language specified but has multiple lines.
    return (
      <>
        <div className="codeWrapper">
          <CodeBlock language="text">{props.children.slice(0, -1)}</CodeBlock>
        </div>
        <style jsx>{`
          .codeWrapper {
            margin-bottom: -1rem;
          }
        `}</style>
      </>
    );
  }
  // Single tick code blocks that do not require a whole highlight block.
  return (
    <>
      <code>{props.children}</code>
      <style jsx>{`
        code {
          border-style: solid;
          border-width: 0.1rem;
          border-radius: 0.4rem;
          border-color: var(--color-light-gray);
          background-color: var(--color-white);
          padding: 0.1rem;
          margin: 0.1rem;
        }
      `}</style>
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
