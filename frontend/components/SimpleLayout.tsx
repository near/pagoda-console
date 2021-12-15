import ConsoleLogo from '../components/ConsoleLogo';
import type { ReactElement } from 'react';

export default function SimpleLayout({ children, footer = null }: { children: ReactElement, footer: ReactElement | null }) {
    return (
        <div className='centeringContainer'>
            <div className='centeredContainer'>
                <ConsoleLogo />
                {/* <main>{children}</main> */}
                {children}
                {footer ?? <></>}
            </div>
            <style jsx>{`
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
    )
}