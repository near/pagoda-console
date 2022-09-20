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
import { AbiService } from './abi.service';
import {
  AddContractAbiDto,
  AddContractAbiSchema,
  GetContractAbiDto,
  GetContractAbiSchema,
} from './dto';

@Controller('abi')
export class AbiController {
  constructor(private readonly abi: AbiService) {}

  @Post('addContractAbi')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(AddContractAbiSchema))
  async addContractAbi(
    @Request() req,
    @Body() { contract, abi }: AddContractAbiDto,
  ) {
    try {
      return await this.abi.addContractAbi(req.user, contract, abi);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('getContractAbi')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetContractAbiSchema))
  async getContractAbi(
    @Request() req,
    @Body() { contract }: GetContractAbiDto,
  ) {
    try {
      return await this.abi.getContractAbi(req.user, contract);
    } catch (e) {
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
