import { CodeBlock } from '@/components/lib/CodeBlock';
import { useQuery } from '@/hooks/query';
import { useSelectedProject } from '@/hooks/selected-project';

export default function ApiKey() {
  const { project } = useSelectedProject();
  const keysQuery = useQuery(['/projects/getKeys', { project: project?.slug || 'unknown' }], {
    enabled: Boolean(project),
  });
  const key = keysQuery.data?.[0].key;
  return (
    <>
      <CodeBlock language="bash">{`near set-api-key $NEAR_CLI_TESTNET_RPC_SERVER_URL ${key}`}</CodeBlock>
    </>
  );
}
