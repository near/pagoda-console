import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import firebaseAdmin from 'firebase-admin';
import { User } from '@pc/database/clients/core';
import { Request } from 'express';
import { Repository } from '@/../database/clients/deploys';
import { DeploysService } from '@/src/modules/deploys/deploys.service';
import { timingSafeEqual } from 'crypto';

type UserDetails = User & { name?: string; picture?: string };

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private deploysService: DeploysService,
  ) {}

  async validateUser(req: Request, token: string): Promise<UserDetails | null> {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

      // reject users who have not completed email verification
      if (
        decodedToken.firebase.sign_in_provider === 'password' &&
        !decodedToken.email_verified &&
        req.path !== '/users/getAccountDetails'
      ) {
        return null;
      }
      if (!decodedToken.email) {
        return null;
      }

      const { user_id: uid, name, picture } = decodedToken;
      let user = await this.usersService.findActive({ uid });
      if (!user) {
        // register user
        user = await this.usersService.create({
          uid,
          email: decodedToken.email,
        });
      }
      return {
        ...user,
        name,
        picture,
      };
    } catch (e) {
      console.error(e);
    }
    return null;
  }
  async validateGithubRepository(
    githubRepoFullName: string,
    token: string,
  ): Promise<Repository | null> {
    const repo = await this.deploysService.getDeployRepository(
      githubRepoFullName,
    );
    if (!repo) return null;

    const hashedInput = this.deploysService.hashToken(
      token,
      repo.authTokenSalt,
    );

    if (timingSafeEqual(hashedInput, repo.authTokenHash)) {
      return repo;
    }

    return null;
  }
}
