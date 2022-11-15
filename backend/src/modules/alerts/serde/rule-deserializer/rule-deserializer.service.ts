import { Injectable } from '@nestjs/common';
import { Alerts } from '@pc/common/types/alerts';
import { assertUnreachable } from 'src/helpers';
import {
  AcctBalMatchingRule,
  EventMatchingRule,
  FnCallMatchingRule,
  MatchingRule,
  TxMatchingRule,
} from '../db.types';

@Injectable()
export class RuleDeserializerService {
  toRuleDto(matchingRule: MatchingRule): Alerts.Rule {
    switch (matchingRule.rule) {
      case 'ACTION_ANY':
        return this.toTxDto(matchingRule);
      case 'ACTION_FUNCTION_CALL':
        return this.toFnCallDto(matchingRule);
      case 'EVENT':
        return this.toEventDto(matchingRule);
      case 'STATE_CHANGE_ACCOUNT_BALANCE':
        if (matchingRule.comparator_kind === 'RELATIVE_PERCENTAGE_AMOUNT') {
          return this.toAcctBalPctDto(matchingRule);
        }
        return this.toAcctBalNumDto(matchingRule);
      default:
        assertUnreachable(
          matchingRule,
          (matchingRule) => (matchingRule as MatchingRule).rule,
        );
    }
  }

  private toTxDto(rule: TxMatchingRule): Alerts.TransactionRule {
    return {
      // TODO: What's with ANY status?
      type: rule.status === 'SUCCESS' ? 'TX_SUCCESS' : 'TX_FAILURE',
      contract: rule.affected_account_id,
    };
  }

  private toFnCallDto(rule: FnCallMatchingRule): Alerts.FunctionCallRule {
    return {
      type: 'FN_CALL',
      contract: rule.affected_account_id,
      function: rule.function,
    };
  }

  private toEventDto(rule: EventMatchingRule): Alerts.EventRule {
    return {
      type: 'EVENT',
      contract: rule.contract_account_id,
      event: rule.event,
      standard: rule.standard,
      version: rule.version,
    };
  }

  private toAcctBalPctDto(rule: AcctBalMatchingRule): Alerts.AcctBalPctRule {
    return {
      type: 'ACCT_BAL_PCT',
      contract: rule.affected_account_id,
      from: rule.comparator_range.from,
      to: rule.comparator_range.to,
    };
  }

  private toAcctBalNumDto(rule: AcctBalMatchingRule): Alerts.AcctBalNumRule {
    return {
      type: 'ACCT_BAL_NUM',
      contract: rule.affected_account_id,
      from: rule.comparator_range.from,
      to: rule.comparator_range.to,
    };
  }
}
