import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import firebaseAdmin from 'firebase-admin';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  //   async validateUser(username: string, pass: string): Promise<any> {
  //     const user = await this.usersService.findOne(username);
  //     if (user && user.password === pass) {
  //       const { password, ...result } = user;
  //       return result;
  //     }
  //     return null;
  //   }
  async validateUser(token: string): Promise<User> {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      const uid = decodedToken.user_id;
      const user = await this.userService.user({ uid });
      return user;
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}
