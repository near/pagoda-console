import JSBI from 'jsbi';

import BatchTransactionIcon from '@/public/static/images/icon-m-batch.svg';
import type { FinalityStatus } from '@/utils/types';

import ActionRow from './ActionRow';
import type { ViewMode } from './ActionRowBlock';
import ActionRowBlock from './ActionRowBlock';
import ActionsList from './ActionsList';
import type { TransactionInfo } from './types';
import type { Receipt } from './types';

interface Props {
  actionGroup: Receipt | TransactionInfo;
  detailsLink?: React.ReactNode;
  status?: React.ReactNode;
  viewMode?: ViewMode;
  title: string;
  icon?: React.ReactElement;
  finalityStatus?: FinalityStatus;
}

const ActionGroup = ({ actionGroup, detailsLink, status, viewMode, title, icon, finalityStatus }: Props) => {
  // const { finalityStatus } = useContext(DatabaseContext);

  if (!actionGroup?.actions) return null;

  const isFinal =
    typeof finalityStatus?.finalBlockTimestampNanosecond !== 'undefined'
      ? JSBI.lessThanOrEqual(
          JSBI.BigInt(actionGroup.blockTimestamp),
          JSBI.divide(finalityStatus.finalBlockTimestampNanosecond, JSBI.BigInt(10 ** 6)),
        )
      : undefined;

  return (
    <>
      {actionGroup.actions.length !== 1 ? (
        <ActionRowBlock
          viewMode={viewMode}
          signerId={actionGroup.signerId}
          blockTimestamp={actionGroup.blockTimestamp}
          detailsLink={detailsLink}
          icon={icon ?? <BatchTransactionIcon />}
          title={title}
          status={status}
          isFinal={isFinal}
        >
          <ActionsList
            actions={actionGroup.actions}
            blockTimestamp={actionGroup.blockTimestamp}
            signerId={actionGroup.signerId}
            receiverId={actionGroup.receiverId}
            detailsLink={detailsLink}
            viewMode={viewMode}
            detalizationMode="minimal"
          />
        </ActionRowBlock>
      ) : (
        <ActionRow
          action={actionGroup.actions[0]}
          signerId={actionGroup.signerId}
          blockTimestamp={actionGroup.blockTimestamp}
          receiverId={actionGroup.receiverId}
          detailsLink={detailsLink}
          viewMode={viewMode}
          detalizationMode="detailed"
          status={status}
          isFinal={isFinal}
        />
      )}
    </>
  );
};

export default ActionGroup;
