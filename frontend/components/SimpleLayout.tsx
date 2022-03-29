import type { ReactElement } from 'react';

import ConsoleLogo from '../components/ConsoleLogo';

export default function SimpleLayout({
  children,
  footer = null,
}: {
  children: ReactElement;
  footer: ReactElement | null;
}) {
  return (
    <div className="centeringContainer">
      <div className="centeredContainer">
        <div className="logoContainer">
          <ConsoleLogo />
        </div>
        {/* <main>{children}</main> */}
        {children}
        {footer ?? <></>}
      </div>
      <style jsx>{`
        .logoContainer {
          margin-bottom: 2rem;
        }
        .centeringContainer {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100vh;
        }
        .centeredContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: auto 0;
          padding: 3rem;
        }
      `}</style>
    </div>
  );
}
