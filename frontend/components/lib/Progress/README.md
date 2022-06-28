# Progress

Implemented via Radix primitives: https://www.radix-ui.com/docs/primitives/components/progress

_If the current props and Stitches style overrides aren't enough to cover your use case, feel free to implement your own component using the Radix primitives directly._

## Example

```tsx

import { Progress } from '@/components/lib/Progress';

...

const [progressValue, setProgressValue] = useState(0);

...

<Progress value={progressValue} max={100} />
```

## With Text & Max Width

```tsx
import { Progress } from '@/components/lib/Progress';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';

...

<Flex justify="center" align="center" stack>
  <Progress css={{ maxWidth: '30rem' }} value={progressValue} max={100} />
  <Text family="number">{progressValue + '%'}</Text>
</Flex>
```
