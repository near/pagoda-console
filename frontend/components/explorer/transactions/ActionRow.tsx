import type { Explorer } from '@pc/common/types/core';
import { PureComponent } from 'react';

import actionIcons from './ActionIcons';
import ActionMessage from './ActionMessage';
import type { DetalizationMode, ViewMode } from './ActionRowBlock';
import ActionRowBlock from './ActionRowBlock';
// import * as T from "../../libraries/explorer-wamp/transactions";

export interface Props {
  action: Explorer.Old.Action;
  blockTimestamp?: number;
  className: string;
  detailsLink?: React.ReactNode;
  detalizationMode: DetalizationMode;
  isFinal?: boolean;
  receiverId: string;
  signerId: string;
  showDetails?: boolean;
  status?: React.ReactNode;
  viewMode: ViewMode;
}

class ActionRow extends PureComponent<Props> {
  static defaultProps = {
    viewMode: 'sparse',
    detalizationMode: 'detailed',
    className: '',
    showDetails: false,
  };

  render() {
    const {
      viewMode,
      detalizationMode,
      className,
      signerId,
      receiverId,
      blockTimestamp,
      detailsLink,
      action,
      showDetails,
      status,
      isFinal,
    } = this.props;
    const ActionIcon = actionIcons[action.kind];
    return (
      <ActionRowBlock
        viewMode={viewMode}
        detalizationMode={detalizationMode}
        className={className}
        signerId={signerId}
        blockTimestamp={blockTimestamp}
        detailsLink={detailsLink}
        icon={ActionIcon && <ActionIcon />}
        title={<ActionMessage receiverId={receiverId} action={action} showDetails={showDetails} />}
        status={status}
        isFinal={isFinal}
      />
    );
  }
}

export default ActionRow;
