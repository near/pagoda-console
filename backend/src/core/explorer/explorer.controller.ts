import { Controller, Post, UsePipes, Body } from '@nestjs/common';
import {
  ExplorerService,
  AccountActivity,
  Transaction,
} from './explorer.service';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import {
  ActivityInputSchemas,
  TransactionInputSchemas,
  BalanceChangesInputSchemas,
  ActivityInputDto,
  TransactionInputDto,
  BalanceChangesInputDto,
} from './dto';

@Controller('explorer')
export class ExplorerController {
  constructor(private readonly explorerService: ExplorerService) {}

  @Post('activity')
  @UsePipes(new JoiValidationPipe(ActivityInputSchemas))
  async activity(
    @Body() { net, contractId }: ActivityInputDto,
  ): Promise<AccountActivity> {
    return this.explorerService.fetchActivity(net, contractId, 50);
  }

  @Post('transaction')
  @UsePipes(new JoiValidationPipe(TransactionInputSchemas))
  async transaction(
    @Body() { net, hash }: TransactionInputDto,
  ): Promise<Transaction> {
    return this.explorerService.fetchTransaction(net, hash);
  }

  @Post('balanceChanges')
  @UsePipes(new JoiValidationPipe(BalanceChangesInputSchemas))
  async balanceChanges(
    @Body() { net, receiptId, accountIds }: BalanceChangesInputDto,
  ): Promise<(string | undefined)[]> {
    return this.explorerService.fetchBalanceChanges(net, receiptId, accountIds);
  }
}
