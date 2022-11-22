import { BearerAuthGuard } from '@/src/core/auth/bearer-auth.guard';
import { JoiValidationPipe } from '@/src/pipes/JoiValidationPipe';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { VError } from 'verror';
import { Api } from '@pc/common/types/api';
import { AbiService } from './abi.service';
import { AddContractAbiSchema, GetContractAbiSchema } from './dto';

@Controller('abi')
export class AbiController {
  constructor(private readonly abi: AbiService) {}

  @Post('addContractAbi')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(AddContractAbiSchema))
  async addContractAbi(
    @Request() req,
    @Body() { contract, abi }: Api.Mutation.Input<'/abi/addContractAbi'>,
  ): Promise<Api.Mutation.Output<'/abi/addContractAbi'>> {
    try {
      return await this.abi.addContractAbi(req.user, contract, abi);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('getContractAbi')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetContractAbiSchema))
  async getContractAbi(
    @Request() req,
    @Body() { contract }: Api.Query.Input<'/abi/getContractAbi'>,
  ): Promise<Api.Query.Output<'/abi/getContractAbi'>> {
    try {
      return await this.abi.getContractAbi(req.user, contract);
    } catch (e: any) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  // TODO log in dev
  // console.error(e);
  const errorInfo = VError.info(e);
  switch (errorInfo?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'NOT_FOUND':
      return new BadRequestException(errorInfo.response);
    default:
      return e;
  }
}
