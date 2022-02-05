import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import OtherCodeBlock from '../CodeBlock';

export interface GitHubReference {
    url: string
    fromLine: number
    toLine: number
    title: string
}

export default function CodeBlock(props: any) {
    let [content, setContent] = useState<string>('');

    function isGithubReference(props: any) {
        return props.className === 'language-rust' && props.children.startsWith('https://github.com/near-examples');
    }

    // className is the language used in the code block.
    // It's currently the only way for us to guess if the .mdx is using a single tick (`) vs three ticks (```).
    // Another way around this would be to call the component directly in Markdown.
    useEffect(() => {
        if (!props.className) {
            return;
        }

        if (typeof props.children !== 'string') {
            setContent(props.children);
        } else if (isGithubReference(props)) {
            const url = props.children;
            // Render the github content in OtherCodeBlock
            const codeSnippetDetails = parseReference(url);
            // This isn't getting the line numbers correctly.
            fetchCode(codeSnippetDetails, setContent);
        } else {
            setContent(props.children.slice(0, props.children.length - 1));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (props.className) {
        return <>
            <OtherCodeBlock>{content}</OtherCodeBlock>
            {isGithubReference(props) && <div className="githubLink"><a href={props.children.slice(0, -1)}>See full example on Github</a></div>}
            <style jsx>{`
                .githubLink {
                    text-align: center;
                }
            `}</style>
        </>;
    }
    return <code>{props.children}</code>;
}

// Similar to what near/docs are doing with this docusaurus theme: https://github.com/saucelabs/docusaurus-theme-github-codeblock#readme
export function parseReference(ref: string): GitHubReference {
    const fullUrl = ref.slice(ref.indexOf('https'), -1)
    const [url, loc] = fullUrl.split('#')

    const [org, repo, blob, branch, ...pathSeg] = new URL(url).pathname.split('/').slice(1)
    const [fromLine, toLine] = loc
        ? loc.split('-').map((lineNr) => parseInt(lineNr.slice(1), 10) - 1)
        : [0, Infinity]

    return {
        url: `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${pathSeg.join('/')}`,
        fromLine,
        toLine,
        title: pathSeg.join('/')
    }
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

        const spaces = line.match(/^\s+/)
        if (spaces) {
            return Math.min(prev, spaces[0].length);
        }

        return 0;
    }, Infinity);

    const content = body.map((line) => line.slice(preceedingSpace)).join('\n');
    setContent(content);
}