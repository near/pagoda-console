import { useApiKeys } from "../../utils/fetchers";
import { useRouteParam } from "../../utils/hooks";
import CodeBlock from "../CodeBlock";

// Returns the testnet api key.
export default function ApiKey() {
    const projectSlug = useRouteParam('project', '/projects');
    const { keys, error: keysError, mutate: mutateKeys } = useApiKeys(projectSlug);
    const key = keys?.TESTNET!;
    return <>
        <CodeBlock language="bash">{`near set-api-key https://testnet.rpc.near.dev/ ${key}`}</CodeBlock>
    </>;
}