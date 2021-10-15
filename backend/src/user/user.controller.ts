import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(BearerAuthGuard)
  @Get('getAccountDetails')
  async getAccountDetails(@Request() req) {
    return req.user;
  }
}
