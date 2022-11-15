import { Api } from '@pc/common/types/api';
import {
  Controller,
  Post,
  UsePipes,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ExplorerService } from './explorer.service';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import {
  ActivityInputSchemas,
  TransactionInputSchemas,
  BalanceChangesInputSchemas,
  GetTransactionsSchema,
} from './dto';
import { IndexerService } from './indexer.service';

@Controller('explorer')
export class ExplorerController {
  constructor(
    private readonly explorerService: ExplorerService,
    private readonly indexerService: IndexerService,
  ) {}

  @Post('activity')
  @UsePipes(new JoiValidationPipe(ActivityInputSchemas))
  async activity(
    @Body() { net, contractId }: Api.Query.Input<'/explorer/activity'>,
  ): Promise<Api.Query.Output<'/explorer/activity'>> {
    return this.explorerService.fetchActivity(net, contractId, 50);
  }

  @Post('transaction')
  @UsePipes(new JoiValidationPipe(TransactionInputSchemas))
  async transaction(
    @Body() { net, hash }: Api.Query.Input<'/explorer/transaction'>,
  ): Promise<Api.Query.Output<'/explorer/transaction'>> {
    const tx = await this.explorerService.fetchTransaction(net, hash);
    if (!tx) {
      throw new BadRequestException('TX_NOT_FOUND');
    }
    return tx;
  }

  @Post('balanceChanges')
  @UsePipes(new JoiValidationPipe(BalanceChangesInputSchemas))
  async balanceChanges(
    @Body()
    { net, receiptId, accountIds }: Api.Query.Input<'/explorer/balanceChanges'>,
  ): Promise<Api.Query.Output<'/explorer/balanceChanges'>> {
    return this.explorerService.fetchBalanceChanges(net, receiptId, accountIds);
  }

  @Post('getTransactions')
  @UsePipes(new JoiValidationPipe(GetTransactionsSchema))
  async getTransactions(
    @Body() { contracts, net }: Api.Query.Input<'/explorer/getTransactions'>,
  ): Promise<Api.Query.Output<'/explorer/getTransactions'>> {
    return this.indexerService.fetchRecentTransactions(contracts, net);
  }
}
