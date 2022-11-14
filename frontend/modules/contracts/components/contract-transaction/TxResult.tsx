import { Flex } from '@/components/lib/Flex';

import TxResultBanner from './TxResultBanner';
import TxResultCode from './TxResultCode';
import TxResultError from './TxResultError';
import TxResultHash from './TxResultHash';

const TxResult = ({ result, error }: { result: any; error: any }) => {
  const bannerView = !result && !error;
  const errorView = error;
  const hashView = result?.hash;
  const CodeView = !error && result && !result.hash;

  return (
    <Flex stack>
      {bannerView && <TxResultBanner />}
      {errorView && <TxResultError error={error} />}
      {hashView && <TxResultHash result={result} />}
      {CodeView && <TxResultCode result={result} />}
    </Flex>
  );
};

export default TxResult;
