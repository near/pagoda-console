import ConsoleLogo from '../components/ConsoleLogo';
import type { ReactNode } from 'react';

export default function SimpleLayout({ children }: { children: ReactNode }) {
    return (
        <div className='centeringContainer'>
            <div className='centeredContainer'>
                <ConsoleLogo />
                {/* <main>{children}</main> */}
                {children}
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
                }
            `}</style>
        </div>
    )
}