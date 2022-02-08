import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

// Don't show the back button if we are going back to these specific routes.
const EXCLUDED_BACK_PATHS = ['/register', '/verification', '/new-project'];

export default function BackButton() {
    const router = useRouter();
    const [lastVisitedPath, setLastVisitedPath] = useState<string>('');

    useEffect(() => {
        let path = window.sessionStorage.getItem("lastVisitedPath");

        // Don't show the back button if we will nav to this same page.
        if (path && path !== router.asPath && !EXCLUDED_BACK_PATHS.includes(path)) {
            setLastVisitedPath(path);
        }
        // The router path only needs to be verified once. Disabling eslint rule.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>
        {lastVisitedPath && <Button variant="secondary" onClick={() => router.push(lastVisitedPath)}>Back</Button>}
    </>;
}