// TODO
// Instead of this being a dedicated component, we should have a version of CenterModal which takes
// custom children

import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import mixpanel from 'mixpanel-browser';

export default function ForgotPasswordModal({ show, onHide }: { show: boolean, onHide: () => void; }) {
    const [email, setEmail] = useState<string>('');
    const [isSending, setIsSending] = useState<boolean>(false);
    const [hasSent, setHasSent] = useState<boolean>(false);

    async function sendPasswordReset() {
        setIsSending(true);
        const auth = getAuth();
        try {
            await sendPasswordResetEmail(auth, email);
            mixpanel.track('DC Forgot Password', {
                status: 'success'
            });
            setHasSent(true);
        } catch (e: any) {
            mixpanel.track('DC Forgot Password', {
                status: 'failure',
                error: e.code
            });
            // TODO error handling
            console.error(e);
        }
        setIsSending(false);
    }

    function close() {
        onHide();
        setHasSent(false);
        setEmail('');
    }

    return (
        <Modal
            show={show}
            onHide={close}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Password Reset
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!hasSent ? <>Please enter your email address
                    < Form onSubmit={sendPasswordReset}>
                        <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form></> : 'Sent!'}
            </Modal.Body>
            {
                !hasSent && <Modal.Footer>
                    <Button onClick={close} variant='secondary'>Cancel</Button>
                    <Button disabled={isSending} onClick={sendPasswordReset} >Send</Button>
                </Modal.Footer>
            }
        </Modal >
    );
}