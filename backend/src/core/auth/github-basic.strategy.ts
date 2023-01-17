import { BasicStrategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GithubBasicStrategy extends PassportStrategy(BasicStrategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(userId: string, password: string): Promise<any> {
    const repo = await this.authService.validateGithubRepository(
      userId,
      password,
    );
    if (!repo) {
      throw new UnauthorizedException();
    }
    return repo;
  }
}
