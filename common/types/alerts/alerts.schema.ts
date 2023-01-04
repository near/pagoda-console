import {
  Alert as AlertDatabase,
  Destination as DestinationDatabase,
  EmailDestination as EmailDestinationDatabase,
  TelegramDestination as TelegramDestinationDatabase,
  WebhookDestination as WebhookDestinationDatabase,
  AggregationDestination as AggregationDestinationDatabase,
} from '@pc/database/clients/alerts';

export type RuleType =
  | 'TX_SUCCESS'
  | 'TX_FAILURE'
  | 'FN_CALL'
  | 'EVENT'
  | 'ACCT_BAL_PCT'
  | 'ACCT_BAL_NUM';

export type TransactionRule = {
  type: 'TX_SUCCESS' | 'TX_FAILURE';
  contract: string;
};
export type FunctionCallRule = {
  type: 'FN_CALL';
  contract: string;
  function: string;
  // params?: object;
};
export type EventRule = {
  type: 'EVENT';
  contract: string;
  standard: string;
  version: string;
  event: string;
  // data?: object;
};
export type AcctBalPctRule = {
  type: 'ACCT_BAL_PCT';
  contract: string;
  from?: number;
  to?: number;
};
export type AcctBalNumRule = {
  type: 'ACCT_BAL_NUM';
  contract: string;
  from?: string;
  to?: string;
};

export type Rule =
  | TransactionRule
  | FunctionCallRule
  | EventRule
  | AcctBalPctRule
  | AcctBalNumRule;

export type CreateAlertBaseInput = {
  name?: string;
  projectSlug: string;
  environmentSubId: number;
  destinations?: Array<number>;
};
type CreateTxAlertInput = CreateAlertBaseInput & {
  rule: TransactionRule;
};
type CreateFnCallAlertInput = CreateAlertBaseInput & {
  rule: FunctionCallRule;
};
type CreateEventAlertInput = CreateAlertBaseInput & {
  rule: EventRule;
};
type CreateAcctBalPctAlertInput = CreateAlertBaseInput & {
  rule: AcctBalPctRule;
};
type CreateAcctBalNumAlertInput = CreateAlertBaseInput & {
  rule: AcctBalNumRule;
};

export type CreateAlertInput =
  | CreateTxAlertInput
  | CreateFnCallAlertInput
  | CreateEventAlertInput
  | CreateAcctBalPctAlertInput
  | CreateAcctBalNumAlertInput;

export type CreateBaseDestinationInput = {
  name?: string;
  projectSlug: string;
};

export type CreateWebhookDestinationConfig = {
  type: 'WEBHOOK';
  url: string;
};
export type CreateEmailDestinationConfig = {
  type: 'EMAIL';
  email: string;
};
export type CreateTelegramDestinationConfig = {
  type: 'TELEGRAM';
};
export type CreateAggregationDestinationConfig = {
  type: 'AGGREGATION';
  contractName: string;
  functionName: string;
};
export type CreateDestinationInput = CreateBaseDestinationInput & {
  config:
    | CreateWebhookDestinationConfig
    | CreateEmailDestinationConfig
    | CreateTelegramDestinationConfig
    | CreateAggregationDestinationConfig;
};

type BaseDestination = Pick<
  DestinationDatabase,
  'id' | 'name' | 'projectSlug' | 'isValid'
>;

export type WebhookDestination = BaseDestination & {
  type: 'WEBHOOK';
  config: Pick<WebhookDestinationDatabase, 'url' | 'secret'>;
};

export type EmailDestination = BaseDestination & {
  type: 'EMAIL';
  config: Pick<EmailDestinationDatabase, 'email'>;
};

export type TelegramDestination = BaseDestination & {
  type: 'TELEGRAM';
  config: Pick<TelegramDestinationDatabase, 'startToken' | 'chatTitle'>;
};

export type AggregationDestination = BaseDestination & {
  type: 'AGGREGATION';
  config: Pick<AggregationDestinationDatabase, 'contractName' | 'functionName'>;
};
export type Destination =
  | WebhookDestination
  | EmailDestination
  | TelegramDestination
  | AggregationDestination;

export type UpdateDestinationBaseInput = {
  id: number;
  name?: string;
};
export type UpdateWebhookDestinationConfig = {
  type: 'WEBHOOK';
  url: string;
};
export type UpdateEmailDestinationConfig = {
  type: 'EMAIL';
};
export type UpdateTelegramDestinationConfig = {
  type: 'TELEGRAM';
};
export type UpdateAggregationDestinationConfig = {
  type: 'AGGREGATION';
  contractName: string;
  functionName: string;
};

export type UpdateDestinationInput = UpdateDestinationBaseInput & {
  config:
    | UpdateWebhookDestinationConfig
    | UpdateEmailDestinationConfig
    | UpdateTelegramDestinationConfig
    | UpdateAggregationDestinationConfig;
};

type EnabledDestination = Pick<DestinationDatabase, 'id' | 'name'> & {
  config:
    | ({ type: 'EMAIL' } & Pick<EmailDestinationDatabase, 'email'>)
    | ({ type: 'WEBHOOK' } & Pick<WebhookDestinationDatabase, 'url'>)
    | ({ type: 'TELEGRAM' } & Pick<
        TelegramDestinationDatabase,
        'chatTitle' | 'startToken'
      >)
    | ({ type: 'AGGREGATION' } & Pick<
        AggregationDestinationDatabase,
        'contractName' | 'functionName'
      >);
};

export type Alert = Pick<
  AlertDatabase,
  'id' | 'name' | 'isPaused' | 'projectSlug' | 'environmentSubId'
> & {
  rule: Rule;
  enabledDestinations: EnabledDestination[];
};

export type TgUpdate = {
  update_id: number;
  message?: {
    chat: TgChat;
    text?: string;
  };
};

export type TgChat = TgPrivateChat | TgGroupChat;

type TgPrivateChat = {
  id: number;
  type: 'private';
  username?: string;
};

type TgGroupChat = {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title?: string;
};

export type Comparator = 'EQ' | 'LTE' | 'GTE' | 'RANGE';

export namespace Query {
  export namespace Inputs {
    export type ListAlerts = { projectSlug: string; environmentSubId: number };
    export type GetAlertDetails = { id: number };
    export type ListDestinations = { projectSlug: string };
  }

  export namespace Outputs {
    export type ListAlerts = Alert[];
    export type GetAlertDetails = Alert;
    export type ListDestinations = Destination[];
  }

  export namespace Errors {
    export type ListAlerts = unknown;
    export type GetAlertDetails = unknown;
    export type ListDestinations = unknown;
  }
}

export namespace Mutation {
  export namespace Inputs {
    export type CreateAlert = CreateAlertInput;
    export type UpdateAlert = { id: number; name?: string; isPaused?: boolean };
    export type DeleteAlert = { id: number };
    export type CreateDestination = CreateDestinationInput;
    export type DeleteDestination = { id: number };
    export type EnableDestination = { alert: number; destination: number };
    export type DisableDestination = { alert: number; destination: number };
    export type UpdateDestination = UpdateDestinationInput;
    export type VerifyEmailDestination = { token: string };
    export type TelegramWebhook = TgUpdate;
    export type ResendEmailVerification = { destinationId: number };
    export type UnsubscribeFromEmailAlert = { token: string };
    export type RotateWebhookDestinationSecret = { destinationId: number };
  }

  export namespace Outputs {
    export type CreateAlert = Alert;
    export type UpdateAlert = Alert;
    export type DeleteAlert = void;
    export type CreateDestination = Destination;
    export type DeleteDestination = void;
    export type EnableDestination = void;
    export type DisableDestination = void;
    export type UpdateDestination = Destination;
    export type VerifyEmailDestination = void;
    export type TelegramWebhook = void;
    export type ResendEmailVerification = void;
    export type UnsubscribeFromEmailAlert = void;
    export type RotateWebhookDestinationSecret = WebhookDestination;
  }

  export namespace Errors {
    export type CreateAlert = unknown;
    export type UpdateAlert = unknown;
    export type DeleteAlert = unknown;
    export type CreateDestination = unknown;
    export type DeleteDestination = unknown;
    export type EnableDestination = unknown;
    export type DisableDestination = unknown;
    export type UpdateDestination = unknown;
    export type VerifyEmailDestination = unknown;
    export type TelegramWebhook = unknown;
    export type ResendEmailVerification = unknown;
    export type UnsubscribeFromEmailAlert = unknown;
    export type RotateWebhookDestinationSecret = unknown;
  }
}
