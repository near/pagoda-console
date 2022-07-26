import { Injectable } from '@nestjs/common';
import { assertUnreachable } from 'src/helpers';
import {
  AcctBalMatchingRule,
  EventMatchingRule,
  FnCallMatchingRule,
  MatchingRule,
  TxMatchingRule,
} from '../db.types';
import {
  AcctBalRuleDto,
  EventRuleDto,
  FnCallRuleDto,
  TxRuleDto,
} from '../dto.types';

@Injectable()
export class RuleDeserializerService {
  toRuleDto(
    rule: MatchingRule,
  ): TxRuleDto | FnCallRuleDto | EventRuleDto | AcctBalRuleDto {
    const ruleType = rule.rule;
    switch (ruleType) {
      case 'ACTION_ANY':
        return this.toTxDto(rule as TxMatchingRule);
      case 'ACTION_FUNCTION_CALL':
        return this.toFnCallDto(rule as FnCallMatchingRule);
      case 'EVENT':
        return this.toEventDto(rule as EventMatchingRule);
      case 'STATE_CHANGE_ACCOUNT_BALANCE':
        return this.toAcctBalDto(rule as AcctBalMatchingRule);
      default:
        assertUnreachable(ruleType);
    }
  }

  private toTxDto(rule: TxMatchingRule): TxRuleDto {
    return {
      contract: rule.affected_account_id,
    };
  }

  private toFnCallDto(rule: FnCallMatchingRule): FnCallRuleDto {
    return {
      contract: rule.affected_account_id,
      function: rule.function,
    };
  }

  private toEventDto(rule: EventMatchingRule): EventRuleDto {
    return {
      contract: rule.contract_account_id,
      event: rule.event,
      standard: rule.standard,
      version: rule.version,
    };
  }

  private toAcctBalDto(rule: AcctBalMatchingRule): AcctBalRuleDto {
    return {
      contract: rule.affected_account_id,
      from: rule.comparator_range.from,
      to: rule.comparator_range.to,
    };
  }
}
