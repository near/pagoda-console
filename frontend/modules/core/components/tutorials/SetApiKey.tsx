import { CodeBlock } from '@/components/lib/CodeBlock';
import { useApiKeys } from '@/hooks/api-keys';
import { useSelectedProject } from '@/hooks/selected-project';

export default function ApiKey() {
  const { project } = useSelectedProject();
  const { keys } = useApiKeys(project?.slug);
  const key = keys?.TESTNET;
  return (
    <>
      <CodeBlock language="bash">{`near set-api-key $NEAR_CLI_TESTNET_RPC_SERVER_URL ${key}`}</CodeBlock>
    </>
  );
}
