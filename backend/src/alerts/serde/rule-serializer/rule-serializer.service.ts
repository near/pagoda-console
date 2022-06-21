import { Injectable } from '@nestjs/common';
import { assertUnreachable } from 'src/helpers';
import {
  AcctBalMatchingRule,
  EventMatchingRule,
  FnCallMatchingRule,
  NumberComparator,
  TxMatchingRule,
} from '../db.types';
import {
  AcctBalRuleDto,
  EventRuleDto,
  FnCallRuleDto,
  NumberComparator as DtoNumberComparator,
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
      rule: 'EVENT_ANY',
      affected_account_id: rule.contract,
      status: 'ANY',
      event: rule.event,
      standard: rule.standard,
      version: rule.version,
    };
  }

  toAcctBalJson(
    rule: AcctBalRuleDto,
    percentage: boolean,
  ): AcctBalMatchingRule {
    return {
      rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
      affected_account_id: rule.contract,
      status: 'ANY',
      amount: rule.amount,
      comparator: this.convertComparator(rule.comparator),
      percentage,
    };
  }

  private convertComparator(c: DtoNumberComparator): NumberComparator {
    switch (c) {
      case 'GT':
        return 'GREATER_THAN';
      case 'GTE':
        return 'GREATER_THAN_OR_EQUAL';
      case 'LT':
        return 'LESS_THAN';
      case 'LTE':
        return 'LESS_THAN_OR_EQUAL';
      case 'EQ':
        return 'EQUAL';
      default:
        assertUnreachable(c);
    }
  }
}
