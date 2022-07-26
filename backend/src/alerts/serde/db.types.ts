export type ComparatorKind =
  | 'RELATIVE_YOCTONEAR_AMOUNT'
  | 'RELATIVE_PERCENTAGE_AMOUNT';

export interface MatchingRule {
  rule:
    | 'ACTION_ANY'
    | 'ACTION_FUNCTION_CALL'
    | 'EVENT'
    | 'STATE_CHANGE_ACCOUNT_BALANCE';
}

export interface TxMatchingRule extends MatchingRule {
  rule: 'ACTION_ANY';
  status: 'SUCCESS' | 'FAIL' | 'ANY';
  affected_account_id: string;
}

export interface FnCallMatchingRule extends MatchingRule {
  rule: 'ACTION_FUNCTION_CALL';
  affected_account_id: string;
  status: 'ANY';
  function: string;
}

export interface EventMatchingRule extends MatchingRule {
  rule: 'EVENT';
  contract_account_id: string;
  standard: string;
  version: string;
  event: string;
}

export interface AcctBalMatchingRule extends MatchingRule {
  rule: 'STATE_CHANGE_ACCOUNT_BALANCE';
  affected_account_id: string;
  comparator_kind: ComparatorKind;
  comparator_range: {
    from: string; // yoctoNEAR,
    to: string; // yoctoNEAR
  };
}
