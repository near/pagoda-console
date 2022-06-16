import type { Contract, Environment } from '@/utils/types';

export interface Alert {
  id: number;
  name: string;
  description: string;
  active?: boolean;
  type: AlertType;
  contract: Contract;
  environment: Environment;
  destinations?: Destination[];
  txRule?: TxRule;
  fnCallRule?: FnCallRule;
  eventRule?: EventRule;
  acctBalRule?: AcctBalRule;
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
