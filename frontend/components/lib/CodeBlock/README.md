# Code Block

Our code block component wraps `react-syntax-highlighter`: https://github.com/react-syntax-highlighter/react-syntax-highlighter

All props for `react-syntax-highlighter` can be passed through:

```tsx
import { CodeBlock } from '@/components/lib/CodeBlock';

...

<CodeBlock language="json" showLineNumbers={true}>
  {JSON.stringify(
    {
      age: 45,
      favoriteColor: 'orange',
      name: 'Peyton Manning',
      isQuarterback: true,
    },
    null,
    4,
  )}
</CodeBlock>
```
