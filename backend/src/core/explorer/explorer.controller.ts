import { Controller, Query, Get } from '@nestjs/common';
import { ExplorerService, AccountActivity } from './explorer.service';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { ActivityInputSchemas } from './dto';
import { Net } from '../../../generated/prisma/core';

@Controller('explorer')
export class ExplorerController {
  constructor(private readonly explorerService: ExplorerService) {}

  @Get('activity')
  async create(
    @Query('contractId', new JoiValidationPipe(ActivityInputSchemas.contractId))
    contractId: string,
    @Query('net', new JoiValidationPipe(ActivityInputSchemas.net))
    net: Net,
  ): Promise<AccountActivity> {
    return this.explorerService.fetchActivity(net, contractId, 50);
  }
}
