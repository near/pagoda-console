import { ReactElement } from "react";

export function H1Anchor(props: any) {
    return <>
        <h1>{props.children}</h1>
        <style jsx>{`
            h1 {
                margin-bottom: 2rem;
            }
        `}</style>
    </>;
}

function getAnchor(el: ReactElement | string): string {
    if (typeof el === 'string') {
        // This replacement is trying to mimic the behavior of hash urls in docusaurus on docs.near.org.
        return el.toLowerCase().replaceAll(' ', '-').replaceAll('.', '').replaceAll('\'', '');
    }

    if (el.props) {
        return getAnchor(el.props.children);
    }

    return '';
}

export function H2Anchor(props: any) {
    const anchor = getAnchor(props.children);

    return <>
        <h2>{props.children} <a id={anchor} href={'#' + anchor} title="Direct link to heading">#</a></h2>
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
    </>;
}

export function H3Anchor(props: any) {
    const anchor = getAnchor(props.children);

    return <>
        <h3>{props.children} <a id={anchor} href={'#' + anchor} title="Direct link to heading">#</a></h3>
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
    </>;
}