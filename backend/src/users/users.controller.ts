import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
// import { UpdateDetailsDto, UpdateDetailsSchema } from './dto';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('getAccountDetails')
  @UseGuards(BearerAuthGuard)
  async getAccountDetails(@Request() req) {
    const { uid, email, name, photoUrl } = req.user;
    return { uid, email, name, photoUrl };
  }

  // @Post('updateDetails')
  // @HttpCode(204)
  // @UseGuards(BearerAuthGuard)
  // @UsePipes(new JoiValidationPipe(UpdateDetailsSchema))
  // async updateDetails(@Request() req, @Body() { name }: UpdateDetailsDto) {
  //   const { uid } = req.user;
  //   await this.usersService.updateDetails(uid, {
  //     name,
  //   });
  // }
}
