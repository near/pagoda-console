import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import firebaseAdmin from 'firebase-admin';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
      if (!user) {
        // register user
        console.log('creating user');
        return this.userService.createUser({
          uid,
          name: decodedToken?.name,
          photoUrl: decodedToken?.picture,
          email: decodedToken.email,
          apiKey: uuidv4(),
          apiKeyTest: uuidv4(),
        });
      }
      return user;
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}
