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
  async track(@Request() req, @Body('address') address: string) {
    return this.dappService.track(address, req.user.id);
  }
}
