import {
  //Body,
  Controller,
  InternalServerErrorException,
  HttpCode,
  Post,
  Request,
  UseGuards,
  //UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { User } from '@prisma/client';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import firebaseAdmin from 'firebase-admin';
// import { UpdateDetailsDto, UpdateDetailsSchema } from './dto';
// import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('getAccountDetails')
  @UseGuards(BearerAuthGuard)
  async getAccountDetails(@Request() req) {
    const { uid, email, name, photoUrl } = req.user;
    return { uid, email, name, photoUrl };
  }

  @Post('deleteAccount')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  async deleteAccount(@Request() req) {
    const { uid } = req.user;
    try {
      await firebaseAdmin.auth().deleteUser(uid);
      await this.usersService.deactivateUser(uid);
    } catch (e) {
      throw new InternalServerErrorException();
    }
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
