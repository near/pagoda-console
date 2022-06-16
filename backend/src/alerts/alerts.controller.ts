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
  CreateAcctBalAlertDto,
  CreateAlertDto,
  CreateAlertSchema,
  CreateEventAlertDto,
  CreateTxAlertDto,
  DeleteAlertDto,
  DeleteAlertSchema,
  ListAlertDto,
  ListAlertSchema,
  CreateFnCallAlertDto,
  UpdateAlertSchema,
  UpdateAlertDto,
  CreateWebhookDestinationSchema,
  CreateWebhookDestinationDto,
  GetAlertDetailsSchema,
  GetAlertDetailsDto,
  ListDestinationDto,
  ListDestinationSchema,
  DeleteDestinationDto,
  DeleteDestinationSchema,
} from './dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('createAlert')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateAlertSchema))
  async createAlert(@Request() req, @Body() dto: CreateAlertDto) {
    try {
      switch (dto.type) {
        case 'TX_SUCCESS':
          return await this.alertsService.createTxSuccessAlert(
            req.user,
            dto as CreateTxAlertDto,
          );
        case 'TX_FAILURE':
          return await this.alertsService.createTxFailureAlert(
            req.user,
            dto as CreateTxAlertDto,
          );
        case 'FN_CALL':
          return await this.alertsService.createFnCallAlert(
            req.user,
            dto as CreateFnCallAlertDto,
          );
        case 'EVENT':
          return await this.alertsService.createEventAlert(
            req.user,
            dto as CreateEventAlertDto,
          );
        case 'ACCT_BAL_NUM':
        case 'ACCT_BAL_PCT':
          return await this.alertsService.createAcctBalAlert(
            req.user,
            dto as CreateAcctBalAlertDto,
          );
        default:
          assertUnreachable(dto.type);
      }
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('updateAlert')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateAlertSchema))
  async updateAlert(
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
  async listAlerts(
    @Request() req,
    @Body() { projectSlug, environmentSubId }: ListAlertDto,
  ) {
    try {
      return await this.alertsService.listAlerts(
        req.user,
        projectSlug,
        environmentSubId,
      );
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('deleteAlert')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(DeleteAlertSchema))
  async deleteAlert(@Request() req, @Body() { id }: DeleteAlertDto) {
    try {
      return await this.alertsService.deleteAlert(req.user, id);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('getAlertDetails')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetAlertDetailsSchema))
  async getAlertDetails(@Request() req, @Body() { id }: GetAlertDetailsDto) {
    try {
      return await this.alertsService.getAlertDetails(req.user, id);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('createWebhookDestination')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateWebhookDestinationSchema))
  async createWebhookDestination(
    @Request() req,
    @Body() dto: CreateWebhookDestinationDto,
  ) {
    try {
      return await this.alertsService.createWebhookDestination(req.user, dto);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('deleteDestination')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(DeleteDestinationSchema))
  async deleteDestination(
    @Request() req,
    @Body() { id }: DeleteDestinationDto,
  ) {
    try {
      return await this.alertsService.deleteDestination(req.user, id);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('listDestinations')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(ListDestinationSchema))
  async listDestinations(
    @Request() req,
    @Body() { project }: ListDestinationDto,
  ) {
    try {
      return await this.alertsService.listDestinations(req.user, project);
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
    case 'BAD_DESTINATION':
    case 'BAD_ALERT':
      return new BadRequestException();
    default:
      return e;
  }
}
