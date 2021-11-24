import router from 'next/router';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useSimpleLayout } from "../utils/layouts";
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { useRouteParam } from '../utils/hooks';

export default function Verification() {
    let [hasResent, setHasResent] = useState<boolean>(false);

    const existing = (useRouteParam('existing') === 'true');

    async function queueVerificationCheck() {
        return setTimeout(async () => {
            console.log('reloading');
            await getAuth().currentUser?.reload();
            if (getAuth().currentUser?.emailVerified) {
                router.push('/new-project?onboarding=true');
            } else {
                queueVerificationCheck();
            }
        }, 3000);
    }

    async function resendVerification() {
        try {
            const user = getAuth().currentUser;
            if (!user) {
                throw new Error('User not logged in');
            }
            setHasResent(true);
            // await sendEmailVerification(user);
        } catch (e) {
            // TODO display message that user must log in
            console.error(e);
        }
    }

    // only run once since it will re-queue itself
    useEffect(() => {
        queueVerificationCheck();
    }, []);

    return (
        <div className='pageContainer'>
            A verification message {existing ? 'was previously' : 'has been'} sent to your email address
            {!hasResent ? <Button disabled={hasResent} onClick={resendVerification}>Send Again</Button> : <div className='sentContainer'><span>Sent!</span></div>}
            <style jsx>{`
                .pageContainer {
                    display: flex;
                    flex-direction: column;
                    row-gap: 2rem;
                    align-content: center;
                    width: 22.25rem;
                    text-align: center;
                }
                .sentContainer {
                    height: 2.625rem;
                    color: var(--color-primary);
                    display: flex;
                }
                .sentContainer > span {
                    margin: auto auto;
                }
            `}</style>
        </div>
    )
}

Verification.getLayout = useSimpleLayout;