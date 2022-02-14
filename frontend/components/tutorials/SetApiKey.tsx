import { useApiKeys } from "../../utils/fetchers";
import { useRouteParam } from "../../utils/hooks";
import CodeBlock from "../CodeBlock";
import Config from '../../utils/config';

export default function ApiKey() {
    const projectSlug = useRouteParam('project');
    const { keys, error: keysError, mutate: mutateKeys } = useApiKeys(projectSlug);
    const key = keys?.TESTNET!;
    return <>
        <CodeBlock language="bash">{`near set-api-key ${Config.url.rpc.recommended} ${key}`}</CodeBlock>
    </>;
}