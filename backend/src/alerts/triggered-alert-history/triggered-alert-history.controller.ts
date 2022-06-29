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
} from '../dto';

@Controller('triggeredAlertHistory')
export class TriggeredAlertHistoryController {
  constructor(
    private readonly triggeredAlertHistoryService: TriggeredAlertHistoryService,
  ) {}

  @Post('listTriggeredAlerts')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(ListTriggeredAlertSchema))
  async listTriggeredAlerts(
    @Request() req,
    @Body() { projectSlug, environmentSubId }: ListTriggeredAlertDto,
  ): Promise<TriggeredAlertDetailsResponseDto[]> {
    try {
      return await this.triggeredAlertHistoryService.listTriggeredAlerts(
        req.user,
        projectSlug,
        environmentSubId,
      );
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
