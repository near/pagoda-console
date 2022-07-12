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
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import VError from 'verror';
import { TriggeredAlertHistoryService } from './triggered-alert-history.service';
import {
  ListTriggeredAlertSchema,
  ListTriggeredAlertDto,
  TriggeredAlertDetailsResponseDto,
  CountTriggeredAlertDto,
  CountTriggeredAlertSchema,
} from '../dto';

@Controller('triggeredAlertHistory')
export class TriggeredAlertHistoryController {
  static MAX_RECORDS = 100;

  constructor(
    private readonly triggeredAlertHistoryService: TriggeredAlertHistoryService,
  ) {}

  @Post('countTriggeredAlerts')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CountTriggeredAlertSchema))
  async countTriggeredAlerts(
    @Request() req,
    @Body()
    { projectSlug, environmentSubId, pagingDateTime }: CountTriggeredAlertDto,
  ): Promise<number> {
    try {
      const count =
        await this.triggeredAlertHistoryService.countTriggeredAlertsByProject(
          req.user,
          projectSlug,
          environmentSubId,
          pagingDateTime,
        );
      return count;
    } catch (e) {
      throw mapError(e);
    }
  }

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
    }: ListTriggeredAlertDto,
  ): Promise<TriggeredAlertDetailsResponseDto[]> {
    try {
      return await this.triggeredAlertHistoryService.listTriggeredAlertsByProject(
        req.user,
        projectSlug,
        environmentSubId,
        skip || 0,
        take || 100,
        pagingDateTime,
      );
    } catch (e) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  // TODO log in dev
  console.error(e);
  switch (VError?.info(e)?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'BAD_DESTINATION':
    case 'BAD_ALERT':
      return new BadRequestException();
    default:
      return e;
  }
}
