export type NumberComparator =
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'EQUAL';
//| 'NOT_EQUAL';

export interface MatchingRule {
  rule:
    | 'ACTION_ANY'
    | 'ACTION_FUNCTION_CALL'
    | 'EVENT_ANY'
    | 'STATE_CHANGE_ACCOUNT_BALANCE';
  status: 'SUCCESS' | 'FAIL' | 'ANY';
  affected_account_id: string;
}

export type TxMatchingRule = MatchingRule;

export interface FnCallMatchingRule extends MatchingRule {
  rule: 'ACTION_FUNCTION_CALL';
  affected_account_id: string;
  status: 'ANY';
  function: string;
}

export interface EventMatchingRule extends MatchingRule {
  rule: 'EVENT_ANY';
  affected_account_id: string;
  status: 'ANY';
  event: string;
  standard: string;
  version: string;
}

export interface AcctBalMatchingRule extends MatchingRule {
  rule: 'STATE_CHANGE_ACCOUNT_BALANCE';
  affected_account_id: string;
  status: 'ANY';
  amount: number;
  comparator: NumberComparator;
  percentage: boolean;
}
