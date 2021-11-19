import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(BearerAuthGuard)
  @Post('getAccountDetails')
  async getAccountDetails(@Request() req): Promise<User> {
    // return this.usersService.find({ id: req.user.id });
    return req.user;
  }
}
