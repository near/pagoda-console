import type { ReactNode } from 'react';

export default function TutorialFooter({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="footerContainer">{children}</div>
      <style jsx>{`
        .footerContainer {
          margin-top: 1.25rem;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
        }
      `}</style>
    </>
  );
}
