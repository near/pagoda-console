import { Flex } from '@/components/lib/Flex';

import TxResultBanner from './TxResultBanner';
import TxResultCode from './TxResultCode';
import TxResultError from './TxResultError';
import TxResultHash from './TxResultHash';
import type { TxResultProps } from './types';

const TxResult = ({ result, error, net }: TxResultProps) => {
  const bannerView = !result && !error;
  const errorView = error;
  const hashView = result?.hash;
  const CodeView = !error && result && !result.hash;

  return (
    <Flex stack>
      {bannerView && <TxResultBanner />}
      {errorView && <TxResultError error={error} />}
      {hashView && <TxResultHash result={result} net={net} />}
      {CodeView && <TxResultCode result={result} />}
    </Flex>
  );
};

export default TxResult;
