import type { Abi } from './abi';
import type { Alerts, TriggeredAlerts } from './alerts';
import type { Explorer, Projects, Users } from './core';
import type { RpcStats } from './rpcstats';

export namespace Api {
  export namespace Query {
    type Mapping = {
      '/explorer/activity': {
        input: Explorer.Query.Inputs.Activity;
        output: Explorer.Query.Outputs.Activity;
        error: Explorer.Query.Errors.Activity;
      };
      '/explorer/balanceChanges': {
        input: Explorer.Query.Inputs.BalanceChanges;
        output: Explorer.Query.Outputs.BalanceChanges;
        error: Explorer.Query.Errors.BalanceChanges;
      };
      '/explorer/transaction': {
        input: Explorer.Query.Inputs.GetTransaction;
        output: Explorer.Query.Outputs.GetTransaction;
        error: Explorer.Query.Errors.GetTransaction;
      };
      '/explorer/getTransactions': {
        input: Explorer.Query.Inputs.GetTransactions;
        output: Explorer.Query.Outputs.GetTransactions;
        error: Explorer.Query.Errors.GetTransactions;
      };

      '/projects/getDetails': {
        input: Projects.Query.Inputs.GetDetails;
        output: Projects.Query.Outputs.GetDetails;
        error: Projects.Query.Errors.GetDetails;
      };
      '/projects/getContracts': {
        input: Projects.Query.Inputs.GetContracts;
        output: Projects.Query.Outputs.GetContracts;
        error: Projects.Query.Errors.GetContracts;
      };
      '/projects/getContract': {
        input: Projects.Query.Inputs.GetContract;
        output: Projects.Query.Outputs.GetContract;
        error: Projects.Query.Errors.GetContract;
      };
      '/projects/list': {
        input: Projects.Query.Inputs.List;
        output: Projects.Query.Outputs.List;
        error: Projects.Query.Errors.List;
      };
      '/projects/getEnvironments': {
        input: Projects.Query.Inputs.GetEnvironments;
        output: Projects.Query.Outputs.GetEnvironments;
        error: Projects.Query.Errors.GetEnvironments;
      };
      '/projects/getKeys': {
        input: Projects.Query.Inputs.GetKeys;
        output: Projects.Query.Outputs.GetKeys;
        error: Projects.Query.Errors.GetKeys;
      };

      '/users/getAccountDetails': {
        input: Users.Query.Inputs.GetAccountDetails;
        // TODO: verify those types, no idea where they are from
        output: Users.Query.Outputs.GetAccountDetails;
        error: Users.Query.Errors.GetAccountDetails;
      };
      '/users/listOrgsWithOnlyAdmin': {
        input: Users.Query.Inputs.ListOrgsWithOnlyAdmin;
        output: Users.Query.Outputs.ListOrgsWithOnlyAdmin;
        error: Users.Query.Errors.ListOrgsWithOnlyAdmin;
      };
      '/users/listOrgMembers': {
        input: Users.Query.Inputs.ListOrgMembers;
        output: Users.Query.Outputs.ListOrgMembers;
        error: Users.Query.Errors.ListOrgMembers;
      };
      '/users/listOrgs': {
        input: Users.Query.Inputs.ListOrgs;
        output: Users.Query.Outputs.ListOrgs;
        error: Users.Query.Errors.ListOrgs;
      };

      '/abi/getContractAbi': {
        input: Abi.Query.Inputs.GetContractAbi;
        output: Abi.Query.Outputs.GetContractAbi;
        error: Abi.Query.Errors.GetContractAbi;
      };

      '/alerts/listAlerts': {
        input: Alerts.Query.Inputs.ListAlerts;
        output: Alerts.Query.Outputs.ListAlerts;
        error: Alerts.Query.Errors.ListAlerts;
      };
      '/alerts/getAlertDetails': {
        input: Alerts.Query.Inputs.GetAlertDetails;
        output: Alerts.Query.Outputs.GetAlertDetails;
        error: Alerts.Query.Errors.GetAlertDetails;
      };
      '/alerts/listDestinations': {
        input: Alerts.Query.Inputs.ListDestinations;
        output: Alerts.Query.Outputs.ListDestinations;
        error: Alerts.Query.Errors.ListDestinations;
      };

      '/triggeredAlerts/listTriggeredAlerts': {
        input: TriggeredAlerts.Query.Inputs.ListTriggeredAlerts;
        output: TriggeredAlerts.Query.Outputs.ListTriggeredAlerts;
        error: TriggeredAlerts.Query.Errors.ListTriggeredAlerts;
      };
      '/triggeredAlerts/getTriggeredAlertDetails': {
        input: TriggeredAlerts.Query.Inputs.GetTriggeredAlertDetails;
        output: TriggeredAlerts.Query.Outputs.GetTriggeredAlertDetails;
        error: TriggeredAlerts.Query.Errors.GetTriggeredAlertDetails;
      };

      '/rpcstats/endpointMetrics': {
        input: RpcStats.Query.Inputs.EndpointMetrics;
        output: RpcStats.Query.Outputs.EndpointMetrics;
        error: RpcStats.Query.Errors.EndpointMetrics;
      };
    };

    export type Key = keyof Mapping;
    export type Output<K extends keyof Mapping> = Mapping[K]['output'];
    export type Input<K extends keyof Mapping> = Mapping[K]['input'];
    export type Error<K extends keyof Mapping> = Mapping[K]['error'];
  }

  export namespace Mutation {
    type Mapping = {
      '/projects/create': {
        input: Projects.Mutation.Inputs.Create;
        output: Projects.Mutation.Outputs.Create;
        error: Projects.Mutation.Errors.Create;
      };
      '/projects/ejectTutorial': {
        input: Projects.Mutation.Inputs.EjectTutorial;
        output: Projects.Mutation.Outputs.EjectTutorial;
        error: Projects.Mutation.Errors.EjectTutorial;
      };
      '/projects/delete': {
        input: Projects.Mutation.Inputs.Delete;
        output: Projects.Mutation.Outputs.Delete;
        error: Projects.Mutation.Errors.Delete;
      };
      '/projects/addContract': {
        input: Projects.Mutation.Inputs.AddContract;
        output: Projects.Mutation.Outputs.AddContract;
        error: Projects.Mutation.Errors.AddContract;
      };
      '/projects/removeContract': {
        input: Projects.Mutation.Inputs.RemoveContract;
        output: Projects.Mutation.Outputs.RemoveContract;
        error: Projects.Mutation.Errors.RemoveContract;
      };
      '/projects/rotateKey': {
        input: Projects.Mutation.Inputs.RotateKey;
        output: Projects.Mutation.Outputs.RotateKey;
        error: Projects.Mutation.Errors.RotateKey;
      };
      '/projects/generateKey': {
        input: Projects.Mutation.Inputs.GenerateKey;
        output: Projects.Mutation.Outputs.GenerateKey;
        error: Projects.Mutation.Errors.GenerateKey;
      };
      '/projects/deleteKey': {
        input: Projects.Mutation.Inputs.DeleteKey;
        output: Projects.Mutation.Outputs.DeleteKey;
        error: Projects.Mutation.Errors.DeleteKey;
      };

      '/users/deleteAccount': {
        input: Users.Mutation.Inputs.DeleteAccount;
        output: Users.Mutation.Outputs.DeleteAccount;
        error: Users.Mutation.Errors.DeleteAccount;
      };
      '/users/createOrg': {
        input: Users.Mutation.Inputs.CreateOrg;
        output: Users.Mutation.Outputs.CreateOrg;
        error: Users.Mutation.Errors.CreateOrg;
      };
      '/users/inviteToOrg': {
        input: Users.Mutation.Inputs.InviteToOrg;
        output: Users.Mutation.Outputs.InviteToOrg;
        error: Users.Mutation.Errors.InviteToOrg;
      };
      '/users/acceptOrgInvite': {
        input: Users.Mutation.Inputs.AcceptOrgInvite;
        output: Users.Mutation.Outputs.AcceptOrgInvite;
        error: Users.Mutation.Errors.AcceptOrgInvite;
      };
      '/users/deleteOrg': {
        input: Users.Mutation.Inputs.DeleteOrg;
        output: Users.Mutation.Outputs.DeleteOrg;
        error: Users.Mutation.Errors.DeleteOrg;
      };
      '/users/changeOrgRole': {
        input: Users.Mutation.Inputs.ChangeOrgRole;
        output: Users.Mutation.Outputs.ChangeOrgRole;
        error: Users.Mutation.Errors.ChangeOrgRole;
      };
      '/users/removeFromOrg': {
        input: Users.Mutation.Inputs.RemoveFromOrg;
        output: Users.Mutation.Outputs.RemoveFromOrg;
        error: Users.Mutation.Errors.RemoveFromOrg;
      };
      '/users/removeOrgInvite': {
        input: Users.Mutation.Inputs.RemoveOrgInvite;
        output: Users.Mutation.Outputs.RemoveOrgInvite;
        error: Users.Mutation.Errors.RemoveOrgInvite;
      };
      '/users/resetPassword': {
        input: Users.Mutation.Inputs.ResetPassword;
        output: Users.Mutation.Outputs.ResetPassword;
        error: Users.Mutation.Errors.ResetPassword;
      };

      '/abi/addContractAbi': {
        input: Abi.Mutation.Inputs.AddContractAbi;
        output: Abi.Mutation.Outputs.AddContractAbi;
        error: Abi.Mutation.Errors.AddContractAbi;
      };

      '/alerts/createAlert': {
        input: Alerts.Mutation.Inputs.CreateAlert;
        output: Alerts.Mutation.Outputs.CreateAlert;
        error: Alerts.Mutation.Errors.CreateAlert;
      };
      '/alerts/updateAlert': {
        input: Alerts.Mutation.Inputs.UpdateAlert;
        output: Alerts.Mutation.Outputs.UpdateAlert;
        error: Alerts.Mutation.Errors.UpdateAlert;
      };
      '/alerts/deleteAlert': {
        input: Alerts.Mutation.Inputs.DeleteAlert;
        output: Alerts.Mutation.Outputs.DeleteAlert;
        error: Alerts.Mutation.Errors.DeleteAlert;
      };
      '/alerts/createDestination': {
        input: Alerts.Mutation.Inputs.CreateDestination;
        output: Alerts.Mutation.Outputs.CreateDestination;
        error: Alerts.Mutation.Errors.CreateDestination;
      };
      '/alerts/deleteDestination': {
        input: Alerts.Mutation.Inputs.DeleteDestination;
        output: Alerts.Mutation.Outputs.DeleteDestination;
        error: Alerts.Mutation.Errors.DeleteDestination;
      };
      '/alerts/enableDestination': {
        input: Alerts.Mutation.Inputs.EnableDestination;
        output: Alerts.Mutation.Outputs.EnableDestination;
        error: Alerts.Mutation.Errors.EnableDestination;
      };
      '/alerts/disableDestination': {
        input: Alerts.Mutation.Inputs.DisableDestination;
        output: Alerts.Mutation.Outputs.DisableDestination;
        error: Alerts.Mutation.Errors.DisableDestination;
      };
      '/alerts/updateDestination': {
        input: Alerts.Mutation.Inputs.UpdateDestination;
        output: Alerts.Mutation.Outputs.UpdateDestination;
        error: Alerts.Mutation.Errors.UpdateDestination;
      };
      '/alerts/verifyEmailDestination': {
        input: Alerts.Mutation.Inputs.VerifyEmailDestination;
        output: Alerts.Mutation.Outputs.VerifyEmailDestination;
        error: Alerts.Mutation.Errors.VerifyEmailDestination;
      };
      // TODO: should we expose that?
      '/alerts/telegramWebhook': {
        input: Alerts.Mutation.Inputs.TelegramWebhook;
        output: Alerts.Mutation.Outputs.TelegramWebhook;
        error: Alerts.Mutation.Errors.TelegramWebhook;
      };
      '/alerts/resendEmailVerification': {
        input: Alerts.Mutation.Inputs.ResendEmailVerification;
        output: Alerts.Mutation.Outputs.ResendEmailVerification;
        error: Alerts.Mutation.Errors.ResendEmailVerification;
      };
      '/alerts/unsubscribeFromEmailAlert': {
        input: Alerts.Mutation.Inputs.UnsubscribeFromEmailAlert;
        output: Alerts.Mutation.Outputs.UnsubscribeFromEmailAlert;
        error: Alerts.Mutation.Errors.UnsubscribeFromEmailAlert;
      };
      '/alerts/rotateWebhookDestinationSecret': {
        input: Alerts.Mutation.Inputs.RotateWebhookDestinationSecret;
        output: Alerts.Mutation.Outputs.RotateWebhookDestinationSecret;
        error: Alerts.Mutation.Errors.RotateWebhookDestinationSecret;
      };
    };

    export type Key = keyof Mapping;
    export type Output<K extends keyof Mapping> = Mapping[K]['output'];
    export type Input<K extends keyof Mapping> = Mapping[K]['input'];
    export type Error<K extends keyof Mapping> = Mapping[K]['error'];
  }
}
