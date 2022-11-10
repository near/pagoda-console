import { Injectable } from '@nestjs/common';
import { Alerts } from '@pc/common/types/alerts';
import { VError } from 'verror';
import {
  AcctBalMatchingRule,
  ComparatorKind,
  EventMatchingRule,
  FnCallMatchingRule,
  TxMatchingRule,
} from '../db.types';

@Injectable()
export class RuleSerializerService {
  toTxSuccessJson(rule: Alerts.TransactionRule): TxMatchingRule {
    return {
      rule: 'ACTION_ANY',
      affected_account_id: rule.contract,
      status: 'SUCCESS',
    };
  }

  toTxFailureJson(rule: Alerts.TransactionRule): TxMatchingRule {
    return {
      rule: 'ACTION_ANY',
      affected_account_id: rule.contract,
      status: 'FAIL',
    };
  }

  toFnCallJson(rule: Alerts.FunctionCallRule): FnCallMatchingRule {
    return {
      rule: 'ACTION_FUNCTION_CALL',
      affected_account_id: rule.contract,
      status: 'ANY',
      function: rule.function,
    };
  }

  toEventJson(rule: Alerts.EventRule): EventMatchingRule {
    return {
      rule: 'EVENT',
      contract_account_id: rule.contract,
      standard: rule.standard,
      version: rule.version,
      event: rule.event,
    };
  }

  toAcctBalJson(
    rule: Alerts.AcctBalPctRule | Alerts.AcctBalNumRule,
  ): AcctBalMatchingRule {
    if (!rule.from && !rule.to) {
      throw new VError('Invalid range');
    }

    if (rule.from && rule.to && BigInt(rule.from) > BigInt(rule.to)) {
      throw new VError('Invalid range');
    }

    return {
      rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
      affected_account_id: rule.contract,
      comparator_kind: this.ruleTypeToComparatorKind(rule.type),
      comparator_range: {
        from: rule.from,
        to: rule.to,
      },
    };
  }

  private ruleTypeToComparatorKind(
    ruleType: 'ACCT_BAL_NUM' | 'ACCT_BAL_PCT',
  ): ComparatorKind {
    switch (ruleType) {
      case 'ACCT_BAL_NUM':
        return 'RELATIVE_YOCTONEAR_AMOUNT';
      case 'ACCT_BAL_PCT':
        return 'RELATIVE_PERCENTAGE_AMOUNT';
    }
  }
}
