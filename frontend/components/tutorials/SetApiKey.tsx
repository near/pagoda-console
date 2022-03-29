import { useApiKeys } from '../../utils/fetchers';
import { useRouteParam } from '../../utils/hooks';
import CodeBlock from '../CodeBlock';

export default function ApiKey() {
  const projectSlug = useRouteParam('project');
  const { keys } = useApiKeys(projectSlug);
  const key = keys?.TESTNET;
  return (
    <>
      <CodeBlock language="bash">{`near set-api-key $NEAR_CLI_TESTNET_RPC_SERVER_URL ${key}`}</CodeBlock>
    </>
  );
}
