import { z } from 'zod';

import type { Abi } from './abi';
import type { Alerts, TriggeredAlerts } from './alerts';
import type { Explorer, Projects, Users } from './core';
import type { RpcStats } from './rpcstats';

export namespace Api {
  export namespace Query {
    type Mapping = {
      '/explorer/activity': {
        input: z.infer<typeof Explorer.query.inputs.activity>;
        output: z.infer<typeof Explorer.query.outputs.activity>;
        error: z.infer<typeof Explorer.query.errors.activity>;
      };
      '/explorer/balanceChanges': {
        input: z.infer<typeof Explorer.query.inputs.balanceChanges>;
        output: z.infer<typeof Explorer.query.outputs.balanceChanges>;
        error: z.infer<typeof Explorer.query.errors.balanceChanges>;
      };
      '/explorer/transaction': {
        input: z.infer<typeof Explorer.query.inputs.transaction>;
        output: z.infer<typeof Explorer.query.outputs.transaction>;
        error: z.infer<typeof Explorer.query.errors.transaction>;
      };
      '/explorer/getTransactions': {
        input: z.infer<typeof Explorer.query.inputs.getTransactions>;
        output: z.infer<typeof Explorer.query.outputs.getTransactions>;
        error: z.infer<typeof Explorer.query.errors.getTransactions>;
      };

      '/projects/getDetails': {
        input: z.infer<typeof Projects.query.inputs.getDetails>;
        output: z.infer<typeof Projects.query.outputs.getDetails>;
        error: z.infer<typeof Projects.query.errors.getDetails>;
      };
      '/projects/getContracts': {
        input: z.infer<typeof Projects.query.inputs.getContracts>;
        output: z.infer<typeof Projects.query.outputs.getContracts>;
        error: z.infer<typeof Projects.query.errors.getContracts>;
      };
      '/projects/getContract': {
        input: z.infer<typeof Projects.query.inputs.getContract>;
        output: z.infer<typeof Projects.query.outputs.getContract>;
        error: z.infer<typeof Projects.query.errors.getContract>;
      };
      '/projects/list': {
        input: z.infer<typeof Projects.query.inputs.list>;
        output: z.infer<typeof Projects.query.outputs.list>;
        error: z.infer<typeof Projects.query.errors.list>;
      };
      '/projects/getEnvironments': {
        input: z.infer<typeof Projects.query.inputs.getEnvironments>;
        output: z.infer<typeof Projects.query.outputs.getEnvironments>;
        error: z.infer<typeof Projects.query.errors.getEnvironments>;
      };
      '/projects/getKeys': {
        input: z.infer<typeof Projects.query.inputs.getKeys>;
        output: z.infer<typeof Projects.query.outputs.getKeys>;
        error: z.infer<typeof Projects.query.errors.getKeys>;
      };

      '/users/getAccountDetails': {
        input: z.infer<typeof Users.query.inputs.getAccountDetails>;
        // TODO: verify those types, no idea where they are from
        output: z.infer<typeof Users.query.outputs.getAccountDetails>;
        error: z.infer<typeof Users.query.errors.getAccountDetails>;
      };
      '/users/listOrgsWithOnlyAdmin': {
        input: z.infer<typeof Users.query.inputs.listOrgsWithOnlyAdmin>;
        output: z.infer<typeof Users.query.outputs.listOrgsWithOnlyAdmin>;
        error: z.infer<typeof Users.query.errors.listOrgsWithOnlyAdmin>;
      };
      '/users/listOrgMembers': {
        input: z.infer<typeof Users.query.inputs.listOrgMembers>;
        output: z.infer<typeof Users.query.outputs.listOrgMembers>;
        error: z.infer<typeof Users.query.errors.listOrgMembers>;
      };
      '/users/listOrgs': {
        input: z.infer<typeof Users.query.inputs.listOrgs>;
        output: z.infer<typeof Users.query.outputs.listOrgs>;
        error: z.infer<typeof Users.query.errors.listOrgs>;
      };

      '/abi/getContractAbi': {
        input: z.infer<typeof Abi.query.inputs.getContractAbi>;
        output: z.infer<typeof Abi.query.outputs.getContractAbi>;
        error: z.infer<typeof Abi.query.errors.getContractAbi>;
      };

      '/alerts/listAlerts': {
        input: z.infer<typeof Alerts.query.inputs.listAlerts>;
        output: z.infer<typeof Alerts.query.outputs.listAlerts>;
        error: z.infer<typeof Alerts.query.errors.listAlerts>;
      };
      '/alerts/getAlertDetails': {
        input: z.infer<typeof Alerts.query.inputs.getAlertDetails>;
        output: z.infer<typeof Alerts.query.outputs.getAlertDetails>;
        error: z.infer<typeof Alerts.query.errors.getAlertDetails>;
      };
      '/alerts/listDestinations': {
        input: z.infer<typeof Alerts.query.inputs.listDestinations>;
        output: z.infer<typeof Alerts.query.outputs.listDestinations>;
        error: z.infer<typeof Alerts.query.errors.listDestinations>;
      };

      '/triggeredAlerts/listTriggeredAlerts': {
        input: z.infer<typeof TriggeredAlerts.query.inputs.listTriggeredAlerts>;
        output: z.infer<
          typeof TriggeredAlerts.query.outputs.listTriggeredAlerts
        >;
        error: z.infer<typeof TriggeredAlerts.query.errors.listTriggeredAlerts>;
      };
      '/triggeredAlerts/getTriggeredAlertDetails': {
        input: z.infer<
          typeof TriggeredAlerts.query.inputs.getTriggeredAlertDetails
        >;
        output: z.infer<
          typeof TriggeredAlerts.query.outputs.getTriggeredAlertDetails
        >;
        error: z.infer<
          typeof TriggeredAlerts.query.errors.getTriggeredAlertDetails
        >;
      };

      '/rpcstats/endpointMetrics': {
        input: z.infer<typeof RpcStats.query.inputs.endpointMetrics>;
        output: z.infer<typeof RpcStats.query.outputs.endpointMetrics>;
        error: z.infer<typeof RpcStats.query.errors.endpointMetrics>;
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
        input: z.infer<typeof Projects.mutation.inputs.create>;
        output: z.infer<typeof Projects.mutation.outputs.create>;
        error: z.infer<typeof Projects.mutation.errors.create>;
      };
      '/projects/ejectTutorial': {
        input: z.infer<typeof Projects.mutation.inputs.ejectTutorial>;
        output: z.infer<typeof Projects.mutation.outputs.ejectTutorial>;
        error: z.infer<typeof Projects.mutation.errors.ejectTutorial>;
      };
      '/projects/delete': {
        input: z.infer<typeof Projects.mutation.inputs.delete>;
        output: z.infer<typeof Projects.mutation.outputs.delete>;
        error: z.infer<typeof Projects.mutation.errors.delete>;
      };
      '/projects/addContract': {
        input: z.infer<typeof Projects.mutation.inputs.addContract>;
        output: z.infer<typeof Projects.mutation.outputs.addContract>;
        error: z.infer<typeof Projects.mutation.errors.addContract>;
      };
      '/projects/removeContract': {
        input: z.infer<typeof Projects.mutation.inputs.removeContract>;
        output: z.infer<typeof Projects.mutation.outputs.removeContract>;
        error: z.infer<typeof Projects.mutation.errors.removeContract>;
      };
      '/projects/rotateKey': {
        input: z.infer<typeof Projects.mutation.inputs.rotateKey>;
        output: z.infer<typeof Projects.mutation.outputs.rotateKey>;
        error: z.infer<typeof Projects.mutation.errors.rotateKey>;
      };
      '/projects/generateKey': {
        input: z.infer<typeof Projects.mutation.inputs.generateKey>;
        output: z.infer<typeof Projects.mutation.outputs.generateKey>;
        error: z.infer<typeof Projects.mutation.errors.generateKey>;
      };
      '/projects/deleteKey': {
        input: z.infer<typeof Projects.mutation.inputs.deleteKey>;
        output: z.infer<typeof Projects.mutation.outputs.deleteKey>;
        error: z.infer<typeof Projects.mutation.errors.deleteKey>;
      };

      '/users/deleteAccount': {
        input: z.infer<typeof Users.mutation.inputs.deleteAccount>;
        output: z.infer<typeof Users.mutation.outputs.deleteAccount>;
        error: z.infer<typeof Users.mutation.errors.deleteAccount>;
      };
      '/users/createOrg': {
        input: z.infer<typeof Users.mutation.inputs.createOrg>;
        output: z.infer<typeof Users.mutation.outputs.createOrg>;
        error: z.infer<typeof Users.mutation.errors.createOrg>;
      };
      '/users/inviteToOrg': {
        input: z.infer<typeof Users.mutation.inputs.inviteToOrg>;
        output: z.infer<typeof Users.mutation.outputs.inviteToOrg>;
        error: z.infer<typeof Users.mutation.errors.inviteToOrg>;
      };
      '/users/acceptOrgInvite': {
        input: z.infer<typeof Users.mutation.inputs.acceptOrgInvite>;
        output: z.infer<typeof Users.mutation.outputs.acceptOrgInvite>;
        error: z.infer<typeof Users.mutation.errors.acceptOrgInvite>;
      };
      '/users/deleteOrg': {
        input: z.infer<typeof Users.mutation.inputs.deleteOrg>;
        output: z.infer<typeof Users.mutation.outputs.deleteOrg>;
        error: z.infer<typeof Users.mutation.errors.deleteOrg>;
      };
      '/users/changeOrgRole': {
        input: z.infer<typeof Users.mutation.inputs.changeOrgRole>;
        output: z.infer<typeof Users.mutation.outputs.changeOrgRole>;
        error: z.infer<typeof Users.mutation.errors.changeOrgRole>;
      };
      '/users/removeFromOrg': {
        input: z.infer<typeof Users.mutation.inputs.removeFromOrg>;
        output: z.infer<typeof Users.mutation.outputs.removeFromOrg>;
        error: z.infer<typeof Users.mutation.errors.removeFromOrg>;
      };
      '/users/removeOrgInvite': {
        input: z.infer<typeof Users.mutation.inputs.removeOrgInvite>;
        output: z.infer<typeof Users.mutation.outputs.removeOrgInvite>;
        error: z.infer<typeof Users.mutation.errors.removeOrgInvite>;
      };
      '/users/resetPassword': {
        input: z.infer<typeof Users.mutation.inputs.resetPassword>;
        output: z.infer<typeof Users.mutation.outputs.resetPassword>;
        error: z.infer<typeof Users.mutation.errors.resetPassword>;
      };

      '/abi/addContractAbi': {
        input: z.infer<typeof Abi.mutation.inputs.addContractAbi>;
        output: z.infer<typeof Abi.mutation.outputs.addContractAbi>;
        error: z.infer<typeof Abi.mutation.errors.addContractAbi>;
      };

      '/alerts/createAlert': {
        input: z.infer<typeof Alerts.mutation.inputs.createAlert>;
        output: z.infer<typeof Alerts.mutation.outputs.createAlert>;
        error: z.infer<typeof Alerts.mutation.errors.createAlert>;
      };
      '/alerts/updateAlert': {
        input: z.infer<typeof Alerts.mutation.inputs.updateAlert>;
        output: z.infer<typeof Alerts.mutation.outputs.updateAlert>;
        error: z.infer<typeof Alerts.mutation.errors.updateAlert>;
      };
      '/alerts/deleteAlert': {
        input: z.infer<typeof Alerts.mutation.inputs.deleteAlert>;
        output: z.infer<typeof Alerts.mutation.outputs.deleteAlert>;
        error: z.infer<typeof Alerts.mutation.errors.deleteAlert>;
      };
      '/alerts/createDestination': {
        input: z.infer<typeof Alerts.mutation.inputs.createDestination>;
        output: z.infer<typeof Alerts.mutation.outputs.createDestination>;
        error: z.infer<typeof Alerts.mutation.errors.createDestination>;
      };
      '/alerts/deleteDestination': {
        input: z.infer<typeof Alerts.mutation.inputs.deleteDestination>;
        output: z.infer<typeof Alerts.mutation.outputs.deleteDestination>;
        error: z.infer<typeof Alerts.mutation.errors.deleteDestination>;
      };
      '/alerts/enableDestination': {
        input: z.infer<typeof Alerts.mutation.inputs.enableDestination>;
        output: z.infer<typeof Alerts.mutation.outputs.enableDestination>;
        error: z.infer<typeof Alerts.mutation.errors.enableDestination>;
      };
      '/alerts/disableDestination': {
        input: z.infer<typeof Alerts.mutation.inputs.disableDestination>;
        output: z.infer<typeof Alerts.mutation.outputs.disableDestination>;
        error: z.infer<typeof Alerts.mutation.errors.disableDestination>;
      };
      '/alerts/updateDestination': {
        input: z.infer<typeof Alerts.mutation.inputs.updateDestination>;
        output: z.infer<typeof Alerts.mutation.outputs.updateDestination>;
        error: z.infer<typeof Alerts.mutation.errors.updateDestination>;
      };
      '/alerts/verifyEmailDestination': {
        input: z.infer<typeof Alerts.mutation.inputs.verifyEmailDestination>;
        output: z.infer<typeof Alerts.mutation.outputs.verifyEmailDestination>;
        error: z.infer<typeof Alerts.mutation.errors.verifyEmailDestination>;
      };
      // TODO: should we expose that?
      '/alerts/telegramWebhook': {
        input: z.infer<typeof Alerts.mutation.inputs.telegramWebhook>;
        output: z.infer<typeof Alerts.mutation.outputs.telegramWebhook>;
        error: z.infer<typeof Alerts.mutation.errors.telegramWebhook>;
      };
      '/alerts/resendEmailVerification': {
        input: z.infer<typeof Alerts.mutation.inputs.resendEmailVerification>;
        output: z.infer<typeof Alerts.mutation.outputs.resendEmailVerification>;
        error: z.infer<typeof Alerts.mutation.errors.resendEmailVerification>;
      };
      '/alerts/unsubscribeFromEmailAlert': {
        input: z.infer<typeof Alerts.mutation.inputs.unsubscribeFromEmailAlert>;
        output: z.infer<
          typeof Alerts.mutation.outputs.unsubscribeFromEmailAlert
        >;
        error: z.infer<typeof Alerts.mutation.errors.unsubscribeFromEmailAlert>;
      };
      '/alerts/rotateWebhookDestinationSecret': {
        input: z.infer<
          typeof Alerts.mutation.inputs.rotateWebhookDestinationSecret
        >;
        output: z.infer<
          typeof Alerts.mutation.outputs.rotateWebhookDestinationSecret
        >;
        error: z.infer<
          typeof Alerts.mutation.errors.rotateWebhookDestinationSecret
        >;
      };
    };

    export type Key = keyof Mapping;
    export type Output<K extends keyof Mapping> = Mapping[K]['output'];
    export type Input<K extends keyof Mapping> = Mapping[K]['input'];
    export type Error<K extends keyof Mapping> = Mapping[K]['error'];
  }
}
