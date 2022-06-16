import type { Contract, Environment } from '@/utils/types';

export interface Alert {
  acctBalRule?: AcctBalRule;
  active?: boolean;
  contract: Contract;
  description: string;
  environment: Environment;
  eventRule?: EventRule;
  fnCallRule?: FnCallRule;
  id: number;
  isPaused: boolean;
  name: string;
  txRule?: TxRule;
  type: AlertType;
  webhookDeliveries?: Delivery[];
}

export interface NewAlert {
  type: AlertType;
  contractId: number;
  environmentSubId: number;
  destinations?: number[];
  txRule?: TxRule;
  fnCallRule?: FnCallRule;
  eventRule?: EventRule;
  acctBalRule?: AcctBalRule;
}

export type TxRule = {
  action?:
    | 'CREATE_ACCOUNT'
    | 'DEPLOY_CONTRACT'
    | 'FUNCTION_CALL'
    | 'TRANSFER'
    | 'STAKE'
    | 'ADD_KEY'
    | 'DELETE_KEY'
    | 'DELETE_ACCOUNT';
};

export type EventRule = {
  standard: string;
  version: string;
  event: string;
};

export type FnCallRule = {
  function: string;
};

export type AmountComparator = 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE';

export type AcctBalRule = {
  amount: number;
  comparator: AmountComparator;
};

export type AlertType = 'TX_SUCCESS' | 'TX_FAILURE' | 'EVENT' | 'FN_CALL' | 'ACCT_BAL_PCT' | 'ACCT_BAL_NUM';

export interface Destination {
  id: number;
  name: string;
  projectSlug: string;
  secret: string;
  url: string;
}

export interface NewWebhookDestination {
  name: string;
  project: string;
  url: string;
}

export type DestinationType = 'webhook' | 'email' | 'sms' | 'telegram';

interface Delivery {
  id: number;
  webhookDestination: Destination;
}
