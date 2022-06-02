import { Component } from 'react';

import AccountLink from '../utils/AccountLink';
import Timer from '../utils/Timer';

// import { Translate } from "react-localize-redux";
// import Translate from './Translate';

export type ViewMode = 'sparse' | 'compact';
export type DetalizationMode = 'detailed' | 'minimal';
export interface Props {
  signerId: string;
  blockTimestamp?: number;
  detailsLink?: React.ReactNode;
  viewMode: ViewMode;
  detalizationMode: DetalizationMode;
  className: string;
  icon: React.ReactElement;
  title: React.ReactElement | string;
  children?: React.ReactNode;
  status?: React.ReactNode;
  isFinal?: boolean;
}

class ActionRowBlock extends Component<Props> {
  static defaultProps = {
    viewMode: 'sparse',
    detalizationMode: 'detailed',
    className: '',
  };

  render() {
    const {
      viewMode,
      detalizationMode,
      className,
      signerId,
      blockTimestamp,
      detailsLink,
      icon,
      title,
      status,
      isFinal,
      children,
    } = this.props;

    return (
      <>
        <div className={`action-${viewMode}-row mx-0 row ${className}`}>
          <div className="col-auto">
            <div className="action-row-img">{icon}</div>
          </div>
          <div className="col action-row-details">
            <div className="action-row-message row">
              <div className="col-md-8 col-7">
                <div className="row">
                  <div className="action-row-title col">{title}</div>
                </div>
                {detalizationMode === 'detailed' ? (
                  <div className="row">
                    <div className="action-row-text col">
                      <>by</> <AccountLink accountId={signerId} />
                    </div>
                  </div>
                ) : null}
              </div>
              {detalizationMode === 'detailed' ? (
                <div className="ml-auto text-right col-md-4 col-5">
                  <div className="row">
                    <div className="action-row-txid col">{detailsLink}</div>
                  </div>
                  <div className="row">
                    <div className="action-row-timer col">
                      <span className="action-row-timer-status">
                        {status ?? <>Fetching Status...</>}
                        {isFinal === undefined
                          ? '/' + 'Checking Finality...'
                          : isFinal === true
                          ? ''
                          : '/' + 'Finalizing'}
                      </span>{' '}
                      {blockTimestamp && <Timer time={blockTimestamp} />}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {children}
          </div>
        </div>
        <style jsx global>
          {`
            .action-sparse-row {
              padding-top: 10px;
              padding-bottom: 10px;
              border-top: solid 2px var(--color-surface-1);
            }
            .action-sparse-row .action-sparse-row {
              border-top: 0;
            }

            .action-compact-row .action-row-message {
              margin-bottom: 1em;
            }

            .action-compact-row .action-row-details {
              border-bottom: 2px solid var(--color-surface-1);
              margin: 0.1em 0 0;
              padding-bottom: 8px;
            }

            .action-row-details .action-row-details {
              border: 0;
            }

            .action-compact-row .action-row-img {
              width: 24px;
              height: 24px;
              border: solid 2px var(--color-surface-1);
              background-color: var(--color-surface-1);
              border-radius: 50%;
              margin-right: 8px;
              text-align: center;
              line-height: 1.1;
            }

            .action-sparse-row .action-row-img {
              margin: 10px;
              display: inline;
              height: 20px;
              width: 20px;
            }

            .action-sparse-row .action-row-img svg {
              height: 16px;
              width: 16px;
            }

            .action-row-bottom {
              border-bottom: solid 2px var(--color-surface-1);
            }

            .action-compact-row .action-row-img svg {
              height: 12px;
              width: 12px;
            }

            .action-sparse-row .action-row-toggler {
              width: 10px;
              margin: 10px;
            }

            .action-row-title {
              font-size: 14px;
              font-weight: 500;
              color: var(--color-text-1);
            }

            .action-row-title a {
              color: var(--color-text-2);
            }

            .action-row-title a:hover {
              color: var(--color-text-1);
            }

            .action-row-text {
              font-size: 12px;
              font-weight: 500;
              line-height: 1.5;
              color: var(--color-text-2);
            }

            .action-row-text a {
              color: var(--color-text-2);
            }

            .action-row-text a:hover {
              color: var(--color-text-1);
            }

            .action-row-txid {
              font-size: 14px;
              font-weight: 500;
              line-height: 1.29;
              color: #0072ce;
            }

            .action-row-timer {
              font-size: 12px;
              color: var(--color-text-2);
              font-weight: 100;
            }

            .action-row-timer-status {
              font-weight: 500;
            }

            pre {
              white-space: pre-wrap; /* Since CSS 2.1 */
              white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
              white-space: -pre-wrap; /* Opera 4-6 */
              white-space: -o-pre-wrap; /* Opera 7 */
              word-wrap: break-word; /* Internet Explorer 5.5+ */
            }
          `}
        </style>
      </>
    );
  }
}

export default ActionRowBlock;
