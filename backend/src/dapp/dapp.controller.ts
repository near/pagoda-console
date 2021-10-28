import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { DappService } from './dapp.service';
import { Net } from '@prisma/client';

@Controller('dapp') // TODO should this be plural
export class DappController {
  constructor(private readonly dappService: DappService) {}

  @UseGuards(BearerAuthGuard)
  @Get('getForUser')
  async getDappsForUser(@Request() req): Promise<{ address: string }[]> {
    // TODO pull user ID from auth
    return this.dappService.getForUser(req.user.id);
  }

  @UseGuards(BearerAuthGuard)
  @Post('track')
  async track(
    @Request() req,
    @Body('address') address: string,
    @Body('net') net: Net,
  ) {
    return this.dappService.track(address, net, req.user.id);
  }
}
