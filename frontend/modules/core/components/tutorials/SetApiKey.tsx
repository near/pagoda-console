import { CodeBlock } from '@/components/lib/CodeBlock';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';

export default function ApiKey() {
  const { projectSlug } = useSureProjectContext();
  const keysQuery = useQuery(['/projects/getKeys', { project: projectSlug }]);
  const key = keysQuery.data?.[0].key;
  return (
    <>
      <CodeBlock language="bash">{`near set-api-key $NEAR_CLI_TESTNET_RPC_SERVER_URL ${key}`}</CodeBlock>
    </>
  );
}
