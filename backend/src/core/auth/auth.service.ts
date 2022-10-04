import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import firebaseAdmin from 'firebase-admin';
import { User } from 'pagoda-console-database/clients/core';
import { Request } from 'express';

type UserDetails = User & { name?: string; picture?: string };

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(req: Request, token: string): Promise<UserDetails> {
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
}
