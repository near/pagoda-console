import * as React from 'react';

import * as Tabs from '@/components/lib/Tabs';
import { StableId } from '@/utils/stable-ids';

import InspectReceipt from './InspectReceipt';
import ReceiptDetails from './ReceiptDetails';
import type { NestedReceiptWithOutcome } from './types';

type Props = {
  receipt: NestedReceiptWithOutcome;
};

const ReceiptInfo: React.FC<Props> = React.memo(({ receipt }) => {
  return (
    <Tabs.Root defaultValue="output" css={{ paddingLeft: 40, paddingRight: 40 }}>
      <Tabs.List>
        <Tabs.Trigger stableId={StableId.RECEIPT_INFO_TABS_OUTPUT_TRIGGER} value="output">
          Output
        </Tabs.Trigger>
        <Tabs.Trigger stableId={StableId.RECEIPT_INFO_TABS_INPUT_TRIGGER} value="inspect">
          Inspect
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="output">
        <ReceiptDetails receipt={receipt} />
      </Tabs.Content>

      <Tabs.Content value="inspect">
        <InspectReceipt receipt={receipt} />
      </Tabs.Content>
    </Tabs.Root>
  );
});

ReceiptInfo.displayName = 'ReceiptInfo';

export default ReceiptInfo;
