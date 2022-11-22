import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(req: Request, token: string): Promise<any> {
    const user = await this.authService.validateUser(req, token);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
