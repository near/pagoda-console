// API rule types - this is what the UI/client consumes

export interface TxRuleDto {
  contract: string;
}
export interface FnCallRuleDto {
  contract: string;
  function: string;
  // params?: object;
}
export interface EventRuleDto {
  contract: string;
  standard: string;
  version: string;
  event: string;
  // data?: object;
}
export interface AcctBalRuleDto {
  contract: string;
  from: string;
  to: string;
}

export type RuleType =
  | 'TX_SUCCESS'
  | 'TX_FAILURE'
  | 'FN_CALL'
  | 'EVENT'
  | 'ACCT_BAL_PCT'
  | 'ACCT_BAL_NUM';

export type Net = 'MAINNET' | 'TESTNET';
