export default function TutorialBadge() {
    return <>
        <div className="badgeContainer">
            <span>Tutorial</span>
        </div>
        <style jsx>{`
        .badgeContainer {
            padding: 0 0 0 .5rem;
            display: inline-block;
            vertical-align: middle;
        }
        .badgeContainer :global(span) {
            align-items: center;
            font-weight: bold;
            font-size: .688rem;
            display: inline-block;
            height: 100%;
            white-space: nowrap;
            position: relative;
            border-radius: 3rem;
            overflow: hidden;
            padding: .25rem .5rem;
            text-overflow: ellipsis;
            color: var(--color-accent-dark-orange);
            background: var(--color-accent-orange);
        }
        `}</style>
    </>;

}