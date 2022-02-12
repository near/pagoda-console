import ConsoleLogo from './SmallConsoleLogo';
import type { ReactElement } from 'react';
import { logOut } from '../utils/auth';

export default function SimpleLogoutLayout({ children, footer = null }: { children: ReactElement, footer: ReactElement | null }) {
    return <>
        <div className="topBar">
            <div><ConsoleLogo /></div>
            <div className='logout'><a onClick={logOut}>Log Out</a></div>
            <style jsx>{`
                .topBar {
                    position: absolute;
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    padding: 1.25rem;
                }
                .logout {
                    align-self: flex-end;
                }
                .logout a {
                    text-decoration: none;
                    cursor: pointer;
                }
            `}</style>
        </div>
        <div className='centeringContainer'>
            <div className='centeredContainer'>
                <div className="contentContainer">{children}</div>
                {footer ?? <></>}
            </div>
            <style jsx>{`
                .contentContainer {
                    max-width: 44rem;
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
    </>;
}