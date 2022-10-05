import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(req: Request, username, password): Promise<boolean> {
    if (
      this.configService.get('metrics.user', { infer: true }) === username &&
      this.configService.get('metrics.password', { infer: true }) === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
