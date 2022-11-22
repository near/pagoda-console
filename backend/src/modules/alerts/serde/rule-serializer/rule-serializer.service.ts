import { Injectable } from '@nestjs/common';
import { Alerts } from '@pc/common/types/alerts';
import { VError } from 'verror';
import {
  AcctBalMatchingRule,
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

  toAcctBalNumJson(rule: Alerts.AcctBalNumRule): AcctBalMatchingRule {
    if (!rule.from && !rule.to) {
      throw new VError('Invalid range');
    }

    if (
      rule.from !== undefined &&
      rule.to !== undefined &&
      BigInt(rule.from) > BigInt(rule.to)
    ) {
      throw new VError('Invalid range');
    }

    return {
      rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
      affected_account_id: rule.contract,
      comparator_kind: 'RELATIVE_YOCTONEAR_AMOUNT',
      comparator_range: {
        from: rule.from === undefined ? null : rule.from.toString(),
        to: rule.to === undefined ? null : rule.to.toString(),
      },
    };
  }

  toAcctBalPctJson(rule: Alerts.AcctBalPctRule): AcctBalMatchingRule {
    if (rule.from === undefined && rule.to === undefined) {
      throw new VError('Invalid range');
    }

    if (
      rule.from !== undefined &&
      rule.to !== undefined &&
      rule.from > rule.to
    ) {
      throw new VError('Invalid range');
    }

    return {
      rule: 'STATE_CHANGE_ACCOUNT_BALANCE',
      affected_account_id: rule.contract,
      comparator_kind: 'RELATIVE_PERCENTAGE_AMOUNT',
      comparator_range: {
        from: rule.from === undefined ? null : rule.from.toString(),
        to: rule.to === undefined ? null : rule.to.toString(),
      },
    };
  }
}
