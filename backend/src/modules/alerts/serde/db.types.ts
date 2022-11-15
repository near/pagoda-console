export type ComparatorKind =
  | 'RELATIVE_YOCTONEAR_AMOUNT'
  | 'RELATIVE_PERCENTAGE_AMOUNT';

export interface TxMatchingRule {
  rule: 'ACTION_ANY';
  status: 'SUCCESS' | 'FAIL' | 'ANY';
  affected_account_id: string;
}

export interface FnCallMatchingRule {
  rule: 'ACTION_FUNCTION_CALL';
  affected_account_id: string;
  status: 'ANY';
  function: string;
}

export interface EventMatchingRule {
  rule: 'EVENT';
  contract_account_id: string;
  standard: string;
  version: string;
  event: string;
}

export interface AcctBalMatchingRule {
  rule: 'STATE_CHANGE_ACCOUNT_BALANCE';
  affected_account_id: string;
  comparator_kind: ComparatorKind;
  comparator_range: {
    from: string | null; // yoctoNEAR,
    to: string | null; // yoctoNEAR
  };
}

export type MatchingRule =
  | TxMatchingRule
  | FnCallMatchingRule
  | EventMatchingRule
  | AcctBalMatchingRule;
