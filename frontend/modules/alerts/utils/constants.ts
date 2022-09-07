import type { AlertType, AmountComparator, DestinationType } from './types';

interface AlertTypeOption {
  description: string;
  icon: string;
  name: string;
  value: AlertType;
}

export const alertTypes: Record<AlertType, AlertTypeOption> = {
  TX_SUCCESS: {
    description: 'Triggers whenever a successful action occurs.',
    icon: 'check-circle',
    name: 'Successful Action',
    value: 'TX_SUCCESS',
  },
  TX_FAILURE: {
    description: 'Triggers whenever an action fails.',
    icon: 'alert-circle',
    name: 'Failed Action',
    value: 'TX_FAILURE',
  },
  EVENT: {
    description: 'Triggers whenever a specified event is logged.',
    icon: 'list',
    name: 'Event Logged',
    value: 'EVENT',
  },
  FN_CALL: {
    description: 'Triggers whenever a specified function is called.',
    icon: 'code',
    name: 'Function Called',
    value: 'FN_CALL',
  },
  ACCT_BAL_NUM: {
    description: `Triggers whenever an account's balance changed by specified amount.`,
    icon: 'shuffle',
    name: 'Account Balance Changed',
    value: 'ACCT_BAL_NUM',
  },
  ACCT_BAL_PCT: {
    description: `Triggers whenever an account's balance changed by specified percentage.`,
    icon: 'percent',
    name: 'Account Balance Changed by %',
    value: 'ACCT_BAL_PCT',
  },
};

export const alertTypeOptions = [
  alertTypes.TX_SUCCESS,
  alertTypes.TX_FAILURE,
  alertTypes.EVENT,
  alertTypes.FN_CALL,
  alertTypes.ACCT_BAL_NUM,
  alertTypes.ACCT_BAL_PCT,
];

interface AmountComparatorOption {
  icon: string;
  name: string;
  value: AmountComparator;
}

export const amountComparators: Record<AmountComparator, AmountComparatorOption> = {
  EQ: {
    icon: '==',
    name: 'Equal To',
    value: 'EQ',
  },
  LTE: {
    icon: '<=',
    name: 'Less Than or Equal To',
    value: 'LTE',
  },
  GTE: {
    icon: '>=',
    name: 'Greater Than or Equal To',
    value: 'GTE',
  },
  RANGE: {
    icon: '..',
    name: 'Within Range',
    value: 'RANGE',
  },
};

export const amountComparatorOptions = [
  amountComparators.EQ,
  amountComparators.LTE,
  amountComparators.GTE,
  amountComparators.RANGE,
];

interface DestinationTypeOption {
  description: string;
  disabled?: boolean;
  icon: string;
  name: string;
  value: DestinationType;
}

export const destinationTypes: Record<DestinationType, DestinationTypeOption> = {
  EMAIL: {
    description: 'Send alerts to an email address.',
    icon: 'mail',
    name: 'Email',
    value: 'EMAIL',
  },
  TELEGRAM: {
    description: 'Send alerts to a Telegram chat.',
    icon: 'send',
    name: 'Telegram',
    value: 'TELEGRAM',
  },
  WEBHOOK: {
    description: 'Send alerts to a webhook.',
    icon: 'terminal',
    name: 'Webhook',
    value: 'WEBHOOK',
  },
};

export const destinationTypeOptions = [destinationTypes.TELEGRAM, destinationTypes.WEBHOOK, destinationTypes.EMAIL];
