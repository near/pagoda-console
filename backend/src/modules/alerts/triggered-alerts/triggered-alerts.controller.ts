import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { BearerAuthGuard } from 'src/core/auth/bearer-auth.guard';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { VError } from 'verror';
import { TriggeredAlertsService } from './triggered-alerts.service';
import {
  ListTriggeredAlertSchema,
  ListTriggeredAlertDto,
  TriggeredAlertsResponseDto,
  GetTriggeredAlertDetailsSchema,
  TriggeredAlertDetailsResponseDto,
  GetTriggeredAlertDetailsDto,
} from '../dto';

@Controller('triggeredAlerts')
export class TriggeredAlertsController {
  static MAX_RECORDS = 100;

  constructor(
    private readonly triggeredAlertsService: TriggeredAlertsService,
  ) {}

  @Post('listTriggeredAlerts')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(ListTriggeredAlertSchema))
  async listTriggeredAlerts(
    @Request() req,
    @Body()
    {
      projectSlug,
      environmentSubId,
      skip,
      take,
      pagingDateTime,
      alertId,
    }: ListTriggeredAlertDto,
  ): Promise<TriggeredAlertsResponseDto> {
    try {
      return await this.triggeredAlertsService.listTriggeredAlertsByProject(
        req.user,
        projectSlug,
        environmentSubId,
        skip || 0,
        take || 100,
        pagingDateTime,
        alertId,
      );
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('getTriggeredAlertDetails')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(GetTriggeredAlertDetailsSchema))
  async getTriggeredAlertDetails(
    @Request() req,
    @Body() { slug }: GetTriggeredAlertDetailsDto,
  ): Promise<TriggeredAlertDetailsResponseDto> {
    try {
      return await this.triggeredAlertsService.getTriggeredAlertDetails(
        req.user,
        slug,
      );
    } catch (e) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
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
