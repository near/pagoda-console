export default function H2Anchor({ children }: { children: any }) {
    const anchor = '#' + children.toLowerCase().replace(' ', '-');

    return <>
        <h2>{children} <a href={anchor} title="Direct link to heading">#</a></h2>
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