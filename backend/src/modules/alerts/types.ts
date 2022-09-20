import {
  Destination,
  EmailDestination,
  TelegramDestination,
  WebhookDestination,
} from 'generated/prisma/alerts';

export type RuleType =
  | 'TX_SUCCESS'
  | 'TX_FAILURE'
  | 'FN_CALL'
  | 'EVENT'
  | 'ACCT_BAL_PCT'
  | 'ACCT_BAL_NUM';

export type NumberComparator = 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';

export type Net = 'MAINNET' | 'TESTNET';

export type PremapDestination = Pick<
  Destination,
  'id' | 'name' | 'projectSlug' | 'type' | 'isValid'
> & {
  webhookDestination?: Partial<WebhookDestination>;
  emailDestination?: Partial<EmailDestination>;
  telegramDestination?: Partial<TelegramDestination>;
};
