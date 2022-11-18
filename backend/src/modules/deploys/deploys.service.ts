import { ProjectsService } from '@/src/core/projects/projects.service';
import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { PrismaService } from './prisma.service';
import { Environment, Project, User } from '@pc/database/clients/core';
import { ContractDeployConfig, Repository } from '@pc/database/clients/deploys';
import { VError } from 'verror';

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  13,
);

@Injectable()
export class DeploysService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  /**
   * Creates a Console project then links a github repo
   * to its testnet environment
   */
  async createDeployProject({
    user,
    githubRepoFullName,
    projectName,
  }: {
    user: User;
    githubRepoFullName: string;
    projectName: Project['name'];
  }) {
    let project, environments;

    // create the project which this deployment will be placed under
    try {
      project = await this.projectsService.create(user, projectName);
    } catch (e: any) {
      throw new VError(e, 'Failed to create project for deployment');
    }

    // grab environments from the newly created project because we attach
    // deploys to specific environments
    try {
      environments = await this.projectsService.getEnvironments(user, {
        slug: project.slug,
      });
    } catch (e: any) {
      throw new VError(
        e,
        'Failed to fetch environments for newly created deploy project',
      );
    }

    // for templates, we only support deploying to testnet at the moment, so
    // this is hardcoded
    const testnetEnv = environments.find((env) => env.net === 'TESTNET');
    if (!testnetEnv) {
      throw new VError('Could not find testnet env for newly created project');
    }

    await this.addDeployRepository({
      projectSlug: project.slug,
      environmentSubId: testnetEnv.subId,
      githubRepoFullName,
    });
  }

  /**
   * Sets up a github repo for automated deploys and
   * attaches it to a given project environment
   */
  async addDeployRepository({
    projectSlug,
    environmentSubId,
    githubRepoFullName,
  }: {
    projectSlug: Project['slug'];
    environmentSubId: Environment['subId'];
    githubRepoFullName: string;
  }) {
    await this.prisma.repository.create({
      data: {
        slug: nanoid(),
        projectSlug,
        environmentSubId,
        githubRepoFullName,
      },
    });
  }

  /**
   * Entry point for deploying one or more WASMs from
   * a github repo
   */
  async deployRepository({
    githubRepoFullName,
    commitHash,
    commitMessage,
  }: {
    githubRepoFullName: string;
    commitHash: string;
    commitMessage: string;
    // ...files
  }) {
    console.log(githubRepoFullName, commitHash, commitMessage);
    /*
    - find matching Repository
    - create new RepoDeployment
    - match each bundle to a ContractDeployConfig
      - if a match cannot be found, create a new ContractDeployConfig w/ generateDeployConfig.
        This allows us to be dynamic and handle new contracts as they are added to the repo
        instead of making the contract set static at time of connecting the repo
    - deployContract for contract
    */
  }

  async generateDeployConfig({
    filename,
    repositorySlug,
  }: {
    filename: string;
    repositorySlug: Repository['slug'];
  }) {
    //TODO generate account ID, this is a placeholder
    const nearAccountId = customAlphabet(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      35,
    )();

    const nearPrivateKey = await this.generateDeployKey();
    await this.prisma.contractDeployConfig.create({
      data: {
        slug: nanoid(),
        nearPrivateKey,
        filename,
        repositorySlug,
        nearAccountId,
      },
    });
  }

  /**
   * Deploys a single contract WASM bundle
   */
  async deployContract(/* todo */) {
    // TODO by tools
    // await this.prisma.contractDeployment.create({
    //   data: {
    //     slug: nanoid(),
    //     // etc
    //   },
    // });
  }

  /**
   * Generates new testnet deploy keys
   */
  async generateDeployKey(): Promise<ContractDeployConfig['nearPrivateKey']> {
    // TODO by tools
    return 'todo';
  }
}
