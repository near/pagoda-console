import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ComingSoonBadge() {
  return (
    <>
      <div className="badgeContainer">
        <span>Coming Soon</span>
      </div>
      <style jsx>{`
        .badgeContainer {
          padding: 0 0 0 0.5rem;
          display: inline-block;
          vertical-align: middle;
        }
        .badgeContainer :global(span) {
          align-items: center;
          font-weight: bold;
          font-size: 1rem;
          display: inline-block;
          height: 100%;
          white-space: nowrap;
          width: auto;
          position: relative;
          border-radius: 3rem;
          line-height: 1;
          overflow: hidden;
          padding: 0.25rem 0.5rem;
          text-overflow: ellipsis;
          line-height: 1rem;
          word-break: break-word;
          color: #54595e;
          background: #f8f9fa;
        }
      `}</style>
    </>
  );
}

export type ProjectCardColor = 'orange' | 'green';

export default function ProjectCard(props: {
  path?: string;
  title: string;
  description: string;
  color: ProjectCardColor;
  onClick: () => void;
}) {
  const isComingSoon = !props.path;
  const cursor = !isComingSoon ? 'pointer' : 'auto';
  const iconColor = props.color === 'green' ? 'var(--color-accent-dark-green)' : 'var(--color-accent-dark-orange)';
  const cardColor = props.color === 'green' ? 'var(--color-accent-light-green)' : 'var(--color-accent-orange)';

  return (
    <>
      <div className="projectCard" onClick={() => props.onClick()}>
        <div className="projectTitleWrapper">
          {isComingSoon && (
            <div style={{ position: 'absolute', top: '2.375rem', left: '2.375rem' }}>
              <ComingSoonBadge />
            </div>
          )}
          <div className="projectTitle">
            <b>{props.title}</b>
          </div>
          {!isComingSoon && (
            <div className="titleIcon">
              <FontAwesomeIcon icon={faAngleDoubleRight} />
            </div>
          )}
        </div>
        <div className="projectDescription">
          <p>{props.description}</p>
        </div>
      </div>
      <style jsx>{`
        .projectCard {
          cursor: ${cursor};
          width: 21rem;
          height: 21rem;
          border-radius: 2.625rem;
          background-color: ${isComingSoon ? '#DEE2E6' : cardColor};
        }
        .projectTitleWrapper {
          position: relative;
          padding-top: 50%;
          padding: 50% 2.375rem 0.625rem 2.375rem;
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 2rem;
        }
        .projectTitle {
        }
        .titleIcon {
          ${!isComingSoon && `color:${iconColor}`};
        }
        .projectDescription {
          padding: 0 2.375rem;
          text-overflow: ellipsis;
        }
      `}</style>
    </>
  );
}
