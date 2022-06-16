export type RuleType =
  | 'TX_SUCCESS'
  | 'TX_FAILURE'
  | 'FN_CALL'
  | 'EVENT'
  | 'ACCT_BAL_PCT'
  | 'ACCT_BAL_NUM';

export type NumberComparator = 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';

export type Net = 'MAINNET' | 'TESTNET';
