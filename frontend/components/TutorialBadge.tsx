import { Badge } from "react-bootstrap";

export default function TutorialBadge() {
    return <>
        <div className="badgeContainer">
            <Badge pill bg="info">Tutorial</Badge>
        </div>
        <style jsx>{`
        .badgeContainer {
            padding: 0 0 0 .5rem;
            display: inline-block;
            vertical-align: middle;
        }
        .badgeContainer :global(span) {
            vertical-align: middle;
            margin-top: -0.5rem;
        }
        `}</style>
    </>;

}