import { RuleType } from './alerts.schema';

export type TriggeredAlert = {
  slug: string;
  alertId: number;
  name: string;
  type: RuleType;
  triggeredInBlockHash: string;
  triggeredInTransactionHash: string | null;
  triggeredInReceiptId: string | null;
  triggeredAt: string;
  extraData?: Record<string, unknown>;
};

export type TriggeredAlertList = {
  count: number;
  page: Array<TriggeredAlert>;
};

export namespace Query {
  export namespace Inputs {
    export type ListTriggeredAlerts = {
      projectSlug: string;
      environmentSubId: number;
      skip?: number;
      take?: number;
      pagingDateTime?: Date;
      alertId?: number;
    };
    export type GetTriggeredAlertDetails = { slug: string };
  }

  export namespace Outputs {
    export type ListTriggeredAlerts = TriggeredAlertList;
    export type GetTriggeredAlertDetails = TriggeredAlert;
  }

  export namespace Errors {
    export type ListTriggeredAlerts = unknown;
    export type GetTriggeredAlertDetails = unknown;
  }
}
