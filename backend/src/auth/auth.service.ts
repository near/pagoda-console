import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import firebaseAdmin from 'firebase-admin';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(token: string): Promise<User> {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

      // reject users who have not completed email verification
      if (
        decodedToken.firebase.sign_in_provider === 'password' &&
        !decodedToken.email_verified
      ) {
        return null;
      }

      const uid = decodedToken.user_id;
      const user = await this.usersService.findActive({ uid });
      if (!user) {
        // register user
        return this.usersService.create({
          uid,
          name: decodedToken.name,
          email: decodedToken.email,
          photoUrl: decodedToken.photoUrl,
        });
      }
      return user;
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}
