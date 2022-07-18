// Alerts:

export type Alert = AlertAcctBalPct | AlertAcctBalNum | AlertEvent | AlertFnCall | AlertTxFailure | AlertTxSuccess;

export type AlertType = 'ACCT_BAL_NUM' | 'ACCT_BAL_PCT' | 'EVENT' | 'FN_CALL' | 'TX_FAILURE' | 'TX_SUCCESS';

interface BaseAlert {
  environmentSubId: number;
  projectSlug: string;
  type: AlertType;
}

interface ExtendedAlert extends BaseAlert {
  enabledDestinations: Destination[];
  id: number;
  isPaused: boolean;
  name: string;
}

interface AlertAcctBalNum extends ExtendedAlert {
  rule: RuleAcctBalNum;
  type: 'ACCT_BAL_NUM';
}

interface AlertAcctBalPct extends ExtendedAlert {
  rule: RuleAcctBalPct;
  type: 'ACCT_BAL_PCT';
}

interface AlertEvent extends ExtendedAlert {
  rule: RuleEvent;
  type: 'EVENT';
}

interface AlertFnCall extends ExtendedAlert {
  rule: RuleFnCall;
  type: 'FN_CALL';
}

interface AlertTxFailure extends ExtendedAlert {
  rule: RuleTxFailure;
  type: 'TX_FAILURE';
}

interface AlertTxSuccess extends ExtendedAlert {
  rule: RuleTxSuccess;
  type: 'TX_SUCCESS';
}

export type NewAlert =
  | NewAlertAcctBalNum
  | NewAlertAcctBalPct
  | NewAlertEvent
  | NewAlertFnCall
  | NewAlertTxFailure
  | NewAlertTxSuccess;

interface ExtendedNewAlert extends BaseAlert {
  destinations?: number[];
}

interface NewAlertAcctBalNum extends ExtendedNewAlert {
  rule: RuleAcctBalNum;
  type: 'ACCT_BAL_NUM';
}

interface NewAlertAcctBalPct extends ExtendedNewAlert {
  rule: RuleAcctBalPct;
  type: 'ACCT_BAL_PCT';
}

interface NewAlertEvent extends ExtendedNewAlert {
  rule: RuleEvent;
  type: 'EVENT';
}

interface NewAlertFnCall extends ExtendedNewAlert {
  rule: RuleFnCall;
  type: 'FN_CALL';
}

interface NewAlertTxFailure extends ExtendedNewAlert {
  rule: RuleTxFailure;
  type: 'TX_FAILURE';
}

interface NewAlertTxSuccess extends ExtendedNewAlert {
  rule: RuleTxSuccess;
  type: 'TX_SUCCESS';
}

export interface UpdateAlert {
  id: number;
  isPaused?: boolean;
  name?: string;
}

interface RuleAcctBalNum {
  contract: string;
  amount: number;
  comparator: AmountComparator;
}

interface RuleAcctBalPct {
  contract: string;
  amount: number;
  comparator: AmountComparator;
}

interface RuleEvent {
  contract: string;
  standard: string;
  version: string;
  event: string;
}

interface RuleFnCall {
  contract: string;
  function: string;
}

interface RuleTxFailure {
  contract: string;
}

interface RuleTxSuccess {
  contract: string;
}

export type AmountComparator = 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE';

// Destinations:

export type Destination = EmailDestination | TelegramDestination | WebhookDestination;

export type DestinationType = 'WEBHOOK' | 'EMAIL' | 'TELEGRAM';

interface BaseDestination {
  projectSlug: string;
  type: DestinationType;
}

interface ExtendedDestination extends BaseDestination {
  id: number;
  isValid: boolean;
  name: string;
}

interface EmailDestination extends ExtendedDestination {
  config: ConfigEmail;
  type: 'EMAIL';
}

interface TelegramDestination extends ExtendedDestination {
  config: ConfigTelegram;
  type: 'TELEGRAM';
}

interface WebhookDestination extends ExtendedDestination {
  config: ConfigWebhook & {
    secret: string;
  };
  type: 'WEBHOOK';
}

export type NewDestination = NewEmailDestination | NewTelegramDestination | NewWebhookDestination;

export type UpdateDestination = {
  id: number;
  type: DestinationType;
  config: ConfigEmail | ConfigWebhook | Record<string, never>;
  name: string;
};

type NewDestinationExtended = BaseDestination;

interface NewEmailDestination extends NewDestinationExtended {
  config: ConfigEmail;
  type: 'EMAIL';
}

interface NewTelegramDestination extends NewDestinationExtended {
  config: Record<string, never>;
  type: 'TELEGRAM';
}

interface NewWebhookDestination extends NewDestinationExtended {
  config: ConfigWebhook;
  type: 'WEBHOOK';
}

interface ConfigEmail {
  email: string;
}

interface ConfigTelegram {
  chatTitle: string | null;
  startToken: string;
}

interface ConfigWebhook {
  url: string;
}

export interface TriggeredAlertPagingResponse {
  count: number;
  page: TriggeredAlert[];
}
export interface TriggeredAlert {
  triggeredAlertSlug: string;
  name: string;
  type: AlertType;
  triggeredInBlockHash: string;
  triggeredInTransactionHash: string;
  triggeredInReceiptId: number;
  triggeredAt: string;
  extraData?: Record<string, unknown>;
}
