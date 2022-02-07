import { ReactElement } from "react";

function getAnchor(el: ReactElement | string): string {
    if (typeof el === 'string') {
        // This replacement is trying to mimic the behavior of hash urls in docusaurus on docs.near.org.
        return el.toLowerCase().replaceAll(' ', '-').replaceAll('.', '');
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