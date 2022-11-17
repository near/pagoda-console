import { CodeBlock } from '@/components/lib/CodeBlock';
import { useApiKeys } from '@/hooks/api-keys';
import { useSureProjectContext } from '@/hooks/project-context';

export default function ApiKey() {
  const { projectSlug } = useSureProjectContext();
  const { keys } = useApiKeys(projectSlug);
  const key = keys?.[0].key;
  return (
    <>
      <CodeBlock language="bash">{`near set-api-key $NEAR_CLI_TESTNET_RPC_SERVER_URL ${key}`}</CodeBlock>
    </>
  );
}
