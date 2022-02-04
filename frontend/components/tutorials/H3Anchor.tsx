import { ReactElement } from "react";

export default function H3Anchor(props: any) {
    function getAnchor(el: ReactElement | string): string {
        if (typeof el === 'string') {
            return '#' + el.toLowerCase().replaceAll(' ', '-')
        }

        if (el.props) {
            return getAnchor(el.props.children);
        }

        return '#';
    }

    const anchor = getAnchor(props.children);

    return <>
        <h3>{props.children} <a href={anchor} title="Direct link to heading">#</a></h3>
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