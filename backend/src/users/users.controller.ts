import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(BearerAuthGuard)
  @Post('getAccountDetails')
  async getAccountDetails(@Request() req) {
    const { uid, email, name, photoUrl } = req.user;
    return { uid, email, name, photoUrl };
  }
}
