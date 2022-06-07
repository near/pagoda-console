import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
  UsePipes,
  Request,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { assertUnreachable } from 'src/helpers';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { VError } from 'verror';
import { AlertsService } from './alerts.service';
import {
  CreateAcctBalRuleDto,
  CreateAlertDto,
  CreateAlertSchema,
  CreateEventRuleDto,
  CreateTxRuleDto,
  DeleteAlertDto,
  DeleteAlertSchema,
  ListAlertDto,
  ListAlertSchema,
  CreateFnCallRuleDto,
  UpdateAlertSchema,
  UpdateAlertDto,
} from './dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('createAlert')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateAlertSchema))
  async createRule(@Request() req, @Body() dto: CreateAlertDto) {
    try {
      switch (dto.type) {
        case 'TX_SUCCESS':
          return await this.alertsService.createTxSuccessRule(
            req.user,
            dto as CreateTxRuleDto,
          );
        case 'TX_FAILURE':
          return await this.alertsService.createTxFailureRule(
            req.user,
            dto as CreateTxRuleDto,
          );
        case 'FN_CALL':
          return await this.alertsService.createFnCallRule(
            req.user,
            dto as CreateFnCallRuleDto,
          );
        case 'EVENT':
          return await this.alertsService.createEventRule(
            req.user,
            dto as CreateEventRuleDto,
          );
        case 'ACCT_BAL_NUM':
        case 'ACCT_BAL_PCT':
          return await this.alertsService.createAcctBalRule(
            req.user,
            dto as CreateAcctBalRuleDto,
          );
        default:
          assertUnreachable(dto.type);
      }
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('updateAlert')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateAlertSchema))
  async updateRule(
    @Request() req,
    @Body() { id, name, isPaused }: UpdateAlertDto,
  ) {
    try {
      return await this.alertsService.updateAlert(req.user, id, name, isPaused);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('listAlerts')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(ListAlertSchema))
  async listRules(@Request() req, @Body() { environment }: ListAlertDto) {
    return await this.alertsService.listRules(req.user, environment);
  }

  @Post('deleteAlert')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(DeleteAlertSchema))
  async delete(@Request() req, @Body() { id }: DeleteAlertDto) {
    try {
      return await this.alertsService.deleteRule(req.user, id);
    } catch (e) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  // TODO log in dev
  // console.error(e);
  switch (VError.info(e)?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'BAD_ALERT':
      return new BadRequestException();
    default:
      return e;
  }
}
