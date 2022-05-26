import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  User,
  Project,
  Prisma,
  Net,
  Environment,
  Contract,
  AlertRule,
  FnCallRule,
  AlertRuleType,
} from '@prisma/client';
import axios from 'axios';
import { AppConfig } from 'src/config/validate';
import { PrismaService } from 'src/prisma.service';
import VError from 'verror';

type Rule = { method: FnCallRule['methodName'] };

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<AppConfig>,
  ) {}

  async createRule(
    user: User,
    {
      name,
      type,
      rule,
      environment,
      contract,
    }: {
      name?: AlertRule['name'];
      type: AlertRule['type'];
      environment: AlertRule['environmentId'];
      contract: AlertRule['contractId'];
      rule: Rule;
    },
  ): Promise<{ name: AlertRule['name']; id: AlertRule['id'] }> {
    let alert;

    let ruleInput;

    switch (type) {
      case 'FN_CALL':
        ruleInput = {
          fnCallRule: {
            create: {
              methodName: rule.method,
            },
          },
        };
        break;
    }

    const metadata = {
      createdBy: user.id,
      updatedBy: user.id,
    };

    try {
      const alertInput: Prisma.AlertRuleCreateInput = {
        name: name || (await this.buildName(contract, type, rule)),
        description: '',
        type,
        ...ruleInput,
        contract: {
          connect: {
            id: contract,
          },
        },
        environment: {
          connect: {
            id: environment,
          },
        },
        ...metadata,
      };

      alert = await this.prisma.alertRule.create({
        data: alertInput,
        select: {
          name: true,
          id: true,
        },
      });
    } catch (e) {
      throw new VError(e, 'Failed while executing project creation query');
    }

    return {
      name: alert.name,
      id: alert.id,
    };
  }

  private async buildName(
    contractId: number,
    ruleType: AlertRuleType,
    rule: Rule,
  ): Promise<string> {
    const address = await this.getContractAddress(contractId);

    switch (ruleType) {
      case 'TX_SUCCESS':
        return `Successful transaction in ${address}`;
      case 'TX_FAILURE':
        return `Failed transaction in ${address}`;
      case 'FN_CALL':
        return `Function ${rule.method} called in ${address}`;
      default:
        return `Not implemented for ${address}`;
    }
  }

  private async getContractAddress(contractId: number): Promise<string> {
    let address;
    try {
      const contractFind = await this.prisma.contract.findFirst({
        where: {
          id: contractId,
          active: true,
        },
        select: {
          address: true,
        },
      });

      // will throw if no team found
      if (!contractFind) {
        throw new VError('Query to find contract came back empty');
      }
      address = contractFind.address;
    } catch (e) {
      throw new VError(e, 'Failed to find contract');
    }
    return address;
  }

  //   async delete(
  //     callingUser: User,
  //     projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  //   ): Promise<void> {
  //     // check that project is valid for deletion
  //     let project;
  //     try {
  //       project = await this.prisma.project.findUnique({
  //         where: projectWhereUnique,
  //         select: {
  //           id: true,
  //           active: true,
  //           tutorial: true,
  //         },
  //       });
  //       if (!project || !project.active) {
  //         throw new VError(
  //           { info: { code: 'BAD_PROJECT' } },
  //           'Project not found or project already inactive',
  //         );
  //       }
  //     } catch (e) {
  //       throw new VError(
  //         e,
  //         'Failed while determining project eligibility for deletion',
  //       );
  //     }

  //     // throw an error if the user doesn't have permission to perform this action
  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       projectWhereUnique,
  //     });

  //     try {
  //       // Array of key names/ids to fetch from key service.
  //       const deleteKeys: [Net, number][] = [['TESTNET', 1]];

  //       // Tutorial projects have no Mainnet key.
  //       if (!project.tutorial) {
  //         deleteKeys.push(['MAINNET', 2]);
  //       }

  //       await Promise.all(
  //         deleteKeys.map((keyId) =>
  //           this.keys.invalidate(
  //             `${this.projectRefPrefix || ''}${project.id}_${keyId[1]}`,
  //             keyId[0],
  //           ),
  //         ),
  //       );
  //     } catch (e) {
  //       throw new VError(
  //         e,
  //         'Failed to invalidate one or more keys while deleting project',
  //       );
  //     }

  //     // soft delete the project
  //     try {
  //       await this.prisma.project.update({
  //         where: projectWhereUnique,
  //         data: {
  //           active: false,
  //           updatedByUser: {
  //             connect: {
  //               id: callingUser.id,
  //             },
  //           },
  //         },
  //       });
  //     } catch (e) {
  //       throw new VError(e, 'Failed while soft deleting project');
  //     }
  //   }

  //   async checkUserPermission({
  //     userId,
  //     projectWhereUnique,
  //     environmentWhereUnique,
  //   }: {
  //     userId: number;
  //     projectWhereUnique?: Prisma.ProjectWhereUniqueInput;
  //     environmentWhereUnique?: Prisma.EnvironmentWhereUniqueInput;
  //   }): Promise<void> {
  //     // if the unique property provided is `id` then we can
  //     // reduce the number of subqueries by looking at the id
  //     // directly in the TeamProject table
  //     let teamProjectFilter;
  //     if (projectWhereUnique?.id) {
  //       teamProjectFilter = { projectId: projectWhereUnique.id };
  //     } else if (projectWhereUnique) {
  //       teamProjectFilter = { project: projectWhereUnique };
  //     } else if (environmentWhereUnique) {
  //       teamProjectFilter = {
  //         project: { environments: { some: environmentWhereUnique } },
  //       };
  //     }

  //     const res = await this.prisma.teamMember.findFirst({
  //       where: {
  //         userId,
  //         active: true,
  //         team: {
  //           active: true,
  //           teamProjects: {
  //             some: {
  //               active: true,
  //               ...teamProjectFilter,
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!res) {
  //       throw new VError(
  //         { info: { code: 'PERMISSION_DENIED' } },
  //         'User does not have rights to manage this project',
  //       );
  //     }
  //   }

  //   async addContract(
  //     callingUser: User,
  //     project: Project['slug'],
  //     subId: Environment['subId'],
  //     address: Contract['address'],
  //   ) {
  //     let net: Net;
  //     let environmentId: Environment['id'];
  //     try {
  //       const environment = await this.getActiveEnvironment(project, subId);
  //       net = environment.net;
  //       environmentId = environment.id;
  //     } catch (e) {
  //       throw new VError(
  //         e,
  //         'Failed while checking validity of adding contract to environment',
  //       );
  //     }

  //     // throw an error if the user doesn't have permission to perform this action
  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       environmentWhereUnique: { id: environmentId },
  //     });

  //     try {
  //       return await this.prisma.contract.create({
  //         data: {
  //           address,
  //           environment: {
  //             connect: {
  //               id: environmentId,
  //             },
  //           },
  //           net,
  //           createdByUser: {
  //             connect: {
  //               id: callingUser.id,
  //             },
  //           },
  //           updatedByUser: {
  //             connect: {
  //               id: callingUser.id,
  //             },
  //           },
  //         },
  //         select: {
  //           id: true,
  //           address: true,
  //           net: true,
  //         },
  //       });
  //     } catch (e) {
  //       throw new VError(e, 'Failed while creating contract');
  //     }
  //   }

  //   async removeContract(
  //     callingUser: User,
  //     contractWhereUnique: Prisma.ContractWhereUniqueInput,
  //   ) {
  //     try {
  //       const contract = await this.prisma.contract.findUnique({
  //         where: contractWhereUnique,
  //         select: {
  //           id: true,
  //           environmentId: true,
  //           active: true,
  //         },
  //       });
  //       if (!contract) {
  //         throw new VError(
  //           { info: { code: 'BAD_CONTRACT' } },
  //           'Contract not found',
  //         );
  //       }
  //       if (!contract.active) {
  //         throw new VError(
  //           { info: { code: 'BAD_CONTRACT' } },
  //           'Contract not active',
  //         );
  //       }
  //       // throw an error if the user doesn't have permission to perform this action
  //       await this.checkUserPermission({
  //         userId: callingUser.id,
  //         environmentWhereUnique: {
  //           id: contract.environmentId,
  //         },
  //       });
  //     } catch (e) {
  //       throw new VError(
  //         e,
  //         'Failed while checking validity of deleting contract',
  //       );
  //     }

  //     // soft delete the contract
  //     try {
  //       await this.prisma.contract.update({
  //         where: contractWhereUnique,
  //         data: {
  //           active: false,
  //           updatedByUser: {
  //             connect: {
  //               id: callingUser.id,
  //             },
  //           },
  //         },
  //       });
  //     } catch (e) {
  //       throw new VError(e, 'Failed while soft deleting contract');
  //     }
  //   }

  //   async getContracts(
  //     callingUser: User,
  //     project: Project['slug'],
  //     subId: Environment['subId'],
  //   ) {
  //     const environment = await this.getActiveEnvironment(project, subId, true);

  //     // throw an error if the user doesn't have permission to perform this action
  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       environmentWhereUnique: { id: environment.id },
  //     });

  //     try {
  //       return await this.prisma.contract.findMany({
  //         where: {
  //           active: true,
  //           environmentId: environment.id,
  //         },
  //       });
  //     } catch (e) {
  //       throw new VError(e, 'Failed while getting list of contracts');
  //     }
  //   }

  //   /**
  //    *
  //    * @param projectWhereUnique
  //    * @param assert Should be set to true when this function is being called
  //    *               for an assertion and the full project info does not need
  //    *               to be returned
  //    * @returns full Prisma.Project is assert is false
  //    */
  //   async getActiveProject(
  //     projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  //     assert = false,
  //   ) {
  //     // check that project is active
  //     const project = await this.prisma.project.findUnique({
  //       where: projectWhereUnique,
  //       ...(assert ? { select: { id: true, active: true } } : {}),
  //     });
  //     if (!project) {
  //       throw new VError({ info: { code: 'BAD_PROJECT' } }, 'Project not found');
  //     }
  //     if (!project.active) {
  //       throw new VError({ info: { code: 'BAD_PROJECT' } }, 'Project not active');
  //     }

  //     return project;
  //   }

  //   /**
  //    *
  //    * @param environmentWhereUnique
  //    * @param assert Should be set to true when this function is being called
  //    *               for an assertion and the full project info does not need
  //    *               to be returned
  //    * @returns full Prisma.Project is assert is false
  //    */
  //   async getActiveEnvironment(
  //     projectSlug: Project['slug'],
  //     subId: Environment['subId'],
  //     assert = false,
  //   ) {
  //     // check that project is active
  //     let environment;
  //     if (assert) {
  //       // quick check, only return minimal info
  //       environment = await this.prisma.environment.findFirst({
  //         where: {
  //           subId,
  //           project: {
  //             slug: projectSlug,
  //           },
  //         },
  //         select: { id: true, active: true, project: true },
  //       });
  //     } else {
  //       environment = await this.prisma.environment.findFirst({
  //         where: {
  //           subId,
  //           project: {
  //             slug: projectSlug,
  //           },
  //         },
  //         include: { project: true },
  //       });
  //     }
  //     if (!environment) {
  //       throw new VError(
  //         { info: { code: 'BAD_ENVIRONMENT' } },
  //         'Environment not found',
  //       );
  //     }
  //     if (!environment.active) {
  //       throw new VError(
  //         { info: { code: 'BAD_ENVIRONMENT' } },
  //         'Environment not active',
  //       );
  //     }
  //     if (!environment.project.active) {
  //       throw new VError(
  //         { info: { code: 'BAD_ENVIRONMENT' } },
  //         'Project not active',
  //       );
  //     }

  //     return environment;
  //   }

  //   async list(user: User) {
  //     return await this.prisma.project.findMany({
  //       where: {
  //         active: true,
  //         teamProjects: {
  //           some: {
  //             active: true,
  //             team: {
  //               active: true,
  //               teamMembers: {
  //                 some: {
  //                   active: true,
  //                   userId: user.id,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       include: {
  //         environments: true,
  //       },
  //     });
  //   }

  //   async getEnvironments(
  //     callingUser: User,
  //     projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  //     includeContracts = false,
  //   ) {
  //     let project;
  //     try {
  //       project = await this.getActiveProject(projectWhereUnique);
  //     } catch (e) {
  //       throw new VError(
  //         e,
  //         'Failed while checking validity of project for listing environments',
  //       );
  //     }

  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       projectWhereUnique,
  //     });

  //     // this can be cleaned up, it was changed late to consolidate multiple network
  //     // calls
  //     const environments = await this.prisma.environment.findMany({
  //       where: {
  //         projectId: project.id,
  //         active: true,
  //       },
  //       orderBy: {
  //         id: 'asc',
  //       },
  //       select: {
  //         subId: true,
  //         name: true,
  //         net: true,
  //         contracts: includeContracts
  //           ? {
  //               where: {
  //                 active: true,
  //               },
  //             }
  //           : false,
  //       },
  //     });

  //     // return {
  //     // Note: scream test in removing this, can be reverted if necessary
  //     // project: {
  //     //   name: project.name,
  //     //   slug: project.slug,
  //     // },
  //     // environments,
  //     // };
  //     return environments;
  //   }

  //   async getEnvironmentDetails(
  //     callingUser: User,
  //     project: Project['slug'],
  //     subId: Environment['subId'],
  //   ) {
  //     const environment = await this.getActiveEnvironment(project, subId);

  //     // throw an error if the user doesn't have permission to perform this action
  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       environmentWhereUnique: { id: environment.id },
  //     });

  //     return environment;
  //   }

  //   async getProjectDetails(
  //     callingUser: User,
  //     projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  //   ) {
  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       projectWhereUnique,
  //     });

  //     try {
  //       const { name, slug, tutorial } = await this.getActiveProject(
  //         projectWhereUnique,
  //       );
  //       return { name, slug, tutorial };
  //     } catch (e) {
  //       throw new VError(e, 'Failed while fetching project details');
  //     }
  //   }

  //   async isProjectNameUnique(callingUser: User, name: string) {
  //     try {
  //       // TODO once team/org management is solidified, review the below query.
  //       // This query was created when a team was the highest level that could determine project uniqueness
  //       // and `project` was the only table in the list of relations where `active` could be `false`.
  //       const p = await this.prisma.project.findFirst({
  //         where: {
  //           teamProjects: {
  //             some: {
  //               team: {
  //                 teamMembers: {
  //                   some: {
  //                     userId: callingUser.id,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           name,
  //           active: true,
  //         },
  //         select: {
  //           slug: true,
  //         },
  //       });
  //       return !p;
  //     } catch (e) {
  //       throw new VError(e, 'Failed to guarantee project uniqueness');
  //     }
  //   }

  //   async getKeys(
  //     callingUser: User,
  //     projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  //   ) {
  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       projectWhereUnique,
  //     });

  //     let project: Project;
  //     try {
  //       project = await this.getActiveProject(projectWhereUnique);
  //     } catch (e) {
  //       throw new VError(e, 'Failed while checking that project is active');
  //     }

  //     try {
  //       // Array of key names/ids to fetch from key service.
  //       const fetchKeys: [Net, number][] = [['TESTNET', 1]];

  //       // Tutorial projects have no Mainnet key.
  //       if (!project.tutorial) {
  //         fetchKeys.push(['MAINNET', 2]);
  //       }

  //       const keys = await Promise.all(
  //         fetchKeys.map((keyId) =>
  //           this.keys.fetch(
  //             `${this.projectRefPrefix || ''}${project.id}_${keyId[1]}`,
  //             keyId[0],
  //           ),
  //         ),
  //       );

  //       // Builds an object of the form:
  //       // {
  //       //   TESTNET: '{api_key}',
  //       //   MAINNET: '{api_key}'
  //       // }
  //       return Object.fromEntries(
  //         fetchKeys.map((keyId, i) => [keyId[0], keys[i]]),
  //       );
  //     } catch (e) {
  //       throw new VError(e, 'Failed to fetch keys from key management API');
  //     }
  //   }

  //   async rotateKey(
  //     callingUser: User,
  //     project: Project['slug'],
  //     subId: Environment['subId'],
  //   ) {
  //     const environment = await this.getActiveEnvironment(project, subId);

  //     // throw an error if the user doesn't have permission to perform this action
  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       environmentWhereUnique: { id: environment.id },
  //     });

  //     const keyId = `${this.projectRefPrefix || ''}${
  //       environment.projectId
  //     }_${subId}`;
  //     const net = subId === 2 ? 'MAINNET' : 'TESTNET';
  //     try {
  //       // Track the user's action.
  //       await this.prisma.userAction.create({
  //         data: {
  //           action: 'ROTATE_API_KEY',
  //           data: {
  //             net,
  //             keyId,
  //           },
  //           userId: callingUser.id,
  //         },
  //       });
  //       return { [net]: (await this.keys.rotate(keyId, net)).token };
  //     } catch (e) {
  //       throw new VError(e, `Failed to rotate key ${keyId} on net ${net}`);
  //     }
  //   }

  //   async getRpcUsage(
  //     callingUser: User,
  //     projectWhereUnique: Prisma.ProjectWhereUniqueInput,
  //   ) {
  //     let project;
  //     try {
  //       project = await this.getActiveProject(projectWhereUnique, true);
  //     } catch (e) {
  //       throw new VError(e, 'Failed while checking that project is active');
  //     }

  //     await this.checkUserPermission({
  //       userId: callingUser.id,
  //       projectWhereUnique,
  //     });

  //     let keys: Record<Net, Array<string>>;
  //     try {
  //       // run requests in parallel
  //       const testnetKeyPromise = this.keys.fetchAll(
  //         `${this.projectRefPrefix || ''}${project.id}_1`,
  //         'TESTNET',
  //       );
  //       const mainnetKeyPromise = this.keys.fetchAll(
  //         `${this.projectRefPrefix || ''}${project.id}_2`,
  //         'MAINNET',
  //       );

  //       keys = {
  //         TESTNET: await testnetKeyPromise,
  //         MAINNET: await mainnetKeyPromise,
  //       };
  //     } catch (e) {
  //       throw new VError(e, 'Failed to fetch keys from key management API');
  //     }

  //     if (!keys.TESTNET.length) {
  //       throw new VError('No testnet keys found');
  //     }

  //     let keyList = keys.TESTNET;
  //     if (!keys.MAINNET.length) {
  //       // TODO check this does not cause issues for normal projects by being removed. It is
  //       // being removed last minute to fix tutorial projects
  //       //   throw new VError('No mainnet keys found');
  //     } else {
  //       keyList = keyList.concat(keys.MAINNET);
  //     }

  //     const endDateObject = new Date();
  //     const month = (endDateObject.getMonth() + 1).toString();
  //     const endDate = `${endDateObject.getFullYear()}-${
  //       month.length === 2 ? month : `0${month}`
  //     }-${endDateObject.getDate()}`;

  //     let usageData;
  //     try {
  //       const usageRes = await axios.get(
  //         this.config.get('analytics.url', { infer: true }),
  //         {
  //           params: {
  //             where: `properties["$distinct_id"] in ${JSON.stringify(keyList)}`,
  //             from_date: '2021-01-01', // safe start date before release of developer console
  //             to_date: endDate,
  //           },
  //           headers: {
  //             Authorization: this.mixpanelCredentials,
  //           },
  //         },
  //       );
  //       usageData = usageRes.data;
  //     } catch (e) {
  //       throw new VError(e, 'Failed while fetching usage data from Mixpanel');
  //     }

  //     return {
  //       keys,
  //       events: usageData,
  //     };
  //   }
}
