import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/core';
import { createOAuthUserAuth } from '@octokit/auth-oauth-user';
import { AppConfig } from 'src/config/validate';
import { ConfigService } from '@nestjs/config';
import { User } from '@pc/database/clients/core';
import { PrismaService } from '../prisma.service';
import { VError } from 'verror';
import { Api } from '@pc/common/types/api';

interface GithubAuthRes {
  type?: string;
  tokenType?: string;
  clientType?: string;
  clientId?: string;
  clientSecret?: string;
  token?: string;
  scopes?: string[];
  invalid?: boolean;
}

@Injectable()
export class GithubService {
  private clientId: string;
  private clientSecret: string;
  constructor(
    private config: ConfigService<AppConfig>,
    private prisma: PrismaService,
  ) {
    const { clientId, clientSecret } = this.config.get('github', {
      infer: true,
    })!;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Upserts a GitHub connection for a user
   * @param user
   * @param code Github OAuth code
   */
  async connect(user: User, code: string) {
    // set up octokit instance
    const octokit = new Octokit({
      authStrategy: createOAuthUserAuth,
      auth: {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        code,
      },
    });

    // redeem code for access token
    let accessToken, scopes;
    try {
      const authInfo = (await octokit.auth()) as GithubAuthRes | undefined;
      if (typeof authInfo?.token !== 'string') {
        throw new Error('No access token in auth response');
      }
      accessToken = authInfo.token;
      scopes = authInfo.scopes;
    } catch (e: any) {
      throw new VError(e, 'Failed to call initial octokit.auth()');
    }

    // fetch user's Github handle
    let login;
    try {
      const res = await octokit.request('GET /user');
      login = res.data.login;
    } catch (e: any) {
      throw new VError(e, 'Failed user data fetch with new token');
    }

    // write to DB
    try {
      await this.prisma.githubConnection.upsert({
        where: {
          userId: user.id,
        },
        update: {
          accessToken,
          handle: login,
          scopes: JSON.stringify(scopes),
        },
        create: {
          userId: user.id,
          accessToken,
          handle: login,
          scopes: JSON.stringify(scopes),
        },
      });
    } catch (e: any) {
      throw new VError(e, 'Failed to save Github Connection data via Prisma');
    }
  }

  /**
   * Fetch the handle and status for a user's GitHub connection
   */
  async getConnection(
    user: User,
  ): Promise<Api.Query.Output<'/users/getGithubConnection'>> {
    const connection = await this.prisma.githubConnection.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        handle: true,
        scopes: true,
        accessToken: true,
      },
    });
    if (!connection) {
      return { status: 'NONE' };
    }

    const octokit = new Octokit({
      authStrategy: createOAuthUserAuth,
      auth: {
        clientType: 'oauth-app',
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        token: connection.accessToken,
        scopes: JSON.parse(connection.scopes),
      },
    });

    // https://github.com/octokit/auth-oauth-user.js#oauth-app-authentication-token
    const status = (await octokit.auth('check')) as {
      invalid: boolean | undefined;
    };

    return {
      status: status.invalid ? 'INVALID' : 'VALID',
      handle: connection.handle,
    };
  }

  // TODO move to deploys module
  // async createTemplateRepo(user: User, githubFullName: string) {
  //   let octokit: Octokit;
  //   try {
  //     octokit = await this.getUserOctokit(user);
  //   } catch (e: any) {
  //     throw new VError(
  //       e,
  //       'Could not establish octokit conneciton for template creation',
  //     );
  //   }

  //   await octokit.request(
  //     'POST /repos/{template_owner}/{template_repo}/generate',
  //     {
  //       template_owner: 'mpeter-dev',
  //       template_repo: 'example-template',
  //       name: `used-template-${Date.now()}`,
  //     },
  //   );
  // }

  /**
   * Configures an Octokit instance with a user's stored GitHub connection
   */
  async getUserOctokit(user: User): Promise<Octokit> {
    const connection = await this.prisma.githubConnection.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        scopes: true,
        accessToken: true,
      },
    });
    if (!connection) {
      throw new VError('No connection found for user');
    }
    const octokit = new Octokit({
      authStrategy: createOAuthUserAuth,
      auth: {
        clientType: 'oauth-app',
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        token: connection.accessToken,
        scopes: JSON.parse(connection.scopes),
      },
    });
    // https://github.com/octokit/auth-oauth-user.js#oauth-app-authentication-token
    const status = (await octokit.auth('check')) as {
      invalid: boolean | undefined;
    };
    if (status.invalid) {
      throw new VError('Access token is invalid');
    }

    return octokit;
  }
}
