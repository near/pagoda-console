import { Body, Controller, Get, Post } from '@nestjs/common';
import { DappService } from './dapp.service';

@Controller('dapp') // TODO should this be plural
export class DappController {
  constructor(private readonly dappService: DappService) {}

  @Get('getForUser')
  async getDappsForUser(): Promise<{ address: string }[]> {
    // TODO pull user ID from auth
    return this.dappService.getForUser(1);
  }

  @Post('track')
  async track(@Body('address') address: string) {
    return this.dappService.track(address, 1);
  }
}
