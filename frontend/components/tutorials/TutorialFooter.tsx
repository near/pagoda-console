import type { ReactNode } from 'react';

import { Flex } from '../lib/Flex';

export default function TutorialFooter({ children }: { children: ReactNode }) {
  return (
    <Flex justify="end" align="center" css={{ marginTop: '1.25rem' }}>
      {children}
    </Flex>
  );
}
