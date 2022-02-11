import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ProjectCard(props: { path?: string, title: string, description: string, onClick: () => void }) {
    const isComingSoon = !props.path;
    const opacity = !isComingSoon ? 1 : .5;
    const cursor = !isComingSoon ? 'pointer' : 'auto';

    return <>
        <div className="projectCard" style={{ cursor, opacity }} onClick={() => props.onClick()}>
            <div className="projectTitleWrapper">
                <div className="projectTitle"><b>{props.title}</b></div>
                {!isComingSoon && <div className="titleIcon"><FontAwesomeIcon icon={faAngleDoubleRight} /></div>}
            </div>
            <div className="projectDescription"><p>{props.description}</p></div>
        </div>
        <style jsx>{`
            .projectCard {
                width: 21rem;
                height: 21rem;
                border-radius: 2.625rem;
                background-color: #C4C4C4;
            }
            .projectTitleWrapper {
                padding-top: 50%;
                padding: 50% 2.375rem .625rem 2.375rem; 
                display: flex;
                justify-content: space-between;
                width: 100%;
                font-size: 2rem;
            }
            .projectTitle {}
            .titleIcon {}
            .projectDescription {
                padding: 0 2.375rem;
                text-overflow: ellipsis;
            }
        `}</style>
    </>;
}