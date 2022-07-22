import { Injectable } from '@nestjs/common';
import { VError } from 'verror';
import {
  AcctBalMatchingRule,
  ComparatorKind,
  EventMatchingRule,
  FnCallMatchingRule,
  TxMatchingRule,
} from '../db.types';
import {
  AcctBalRuleDto,
  EventRuleDto,
  FnCallRuleDto,
  RuleType,
  TxRuleDto,
} from '../dto.types';

@Injectable()
export class RuleSerializerService {
  toTxSuccessJson(rule: TxRuleDto): TxMatchingRule {
    return {
      rule: 'ACTION_ANY',
      affected_account_id: rule.contract,
      status: 'SUCCESS',
    };
  }

  toTxFailureJson(rule: TxRuleDto): TxMatchingRule {
    return {
      rule: 'ACTION_ANY',
      affected_account_id: rule.contract,
      status: 'FAIL',
    };
  }

  toFnCallJson(rule: FnCallRuleDto): FnCallMatchingRule {
    return {
      rule: 'ACTION_FUNCTION_CALL',
      affected_account_id: rule.contract,
      status: 'ANY',
      function: rule.function,
    };
  }

  toEventJson(rule: EventRuleDto): EventMatchingRule {
    return {
      rule: 'EVENT',
      contract_account_id: rule.contract,
      standard: rule.standard,
      version: rule.version,
      event: rule.event,
    };
  }

  toAcctBalJson(rule: AcctBalRuleDto, ruleType: RuleType): AcctBalMatchingRule {
    return {
      rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
      contract_account_id: rule.contract,
      comparator_kind: this.ruleTypeToComparatorKind(ruleType),
      comparator_range: {
        from: rule.from,
        to: rule.to,
      },
    };
  }

  private ruleTypeToComparatorKind(ruleType: RuleType): ComparatorKind {
    switch (ruleType) {
      case 'ACCT_BAL_PCT':
        return 'RELATIVE_PERCENTAGE_AMOUNT';
      case 'ACCT_BAL_NUM':
        return 'RELATIVE_YOCTONEAR_AMOUNT';
      default:
        throw new VError(
          { info: { code: 'BAD_ALERT' } },
          'Error while converting rule type to comparator kind',
        );
    }
  }
}
