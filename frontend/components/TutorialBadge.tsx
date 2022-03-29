export default function TutorialBadge({ size }: { size?: string }) {
  return (
    <>
      <div className="badgeContainer">
        <span>Tutorial</span>
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
          font-size: ${size === 'md' ? '1rem' : '.688rem'};
          display: inline-block;
          height: 100%;
          white-space: nowrap;
          position: relative;
          border-radius: 3rem;
          overflow: hidden;
          padding: 0.25rem 0.5rem;
          text-overflow: ellipsis;
          color: var(--color-accent-dark-orange);
          background: var(--color-accent-orange);
        }
      `}</style>
    </>
  );
}
