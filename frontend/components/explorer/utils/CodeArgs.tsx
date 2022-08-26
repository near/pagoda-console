import { hexy } from 'hexy';
import * as React from 'react';

import { CodeBlock } from '@/components/lib/CodeBlock';

const CodeArgs: React.FC<{ args: string }> = React.memo(({ args }) => {
  const decodedArgs = Buffer.from(args, 'base64');
  try {
    const parsedJSONArgs = JSON.parse(decodedArgs.toString());
    return <CodeBlock language="json">{JSON.stringify(parsedJSONArgs, null, 4)}</CodeBlock>;
  } catch {
    return <CodeBlock showLineNumbers>{hexy(decodedArgs, { format: 'twos' })}</CodeBlock>;
  }
});

CodeArgs.displayName = 'CodeArgs';

export default CodeArgs;
