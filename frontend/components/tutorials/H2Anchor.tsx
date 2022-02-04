import { ReactElement } from "react";

export default function H2Anchor(props: any) {
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
        <h2>{props.children} <a href={anchor} title="Direct link to heading">#</a></h2>
        <style jsx>{`
            h2 a { 
                visibility: hidden;
                text-decoration: none;
                text-color: rgba(255, 255, 255,)
            }
            h2:hover a {
                visibility: visible;
            }
        `}</style>
    </>;
}