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
  static MAX_RECORDS = 100;

  constructor(
    private readonly triggeredAlertHistoryService: TriggeredAlertHistoryService,
  ) {}

  @Post('listTriggeredAlerts')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(ListTriggeredAlertSchema))
  async listTriggeredAlerts(
    @Request() req,
    @Body()
    { projectSlug, environmentSubId, skip, take }: ListTriggeredAlertDto,
  ): Promise<TriggeredAlertDetailsResponseDto[]> {
    try {
      const {
        skipParsed,
        takeParsed,
      }: { skipParsed: number; takeParsed: number } = this.parsePagingParams(
        skip,
        take,
      );

      return await this.triggeredAlertHistoryService.listTriggeredAlertsByProject(
        req.user,
        projectSlug,
        environmentSubId,
        skipParsed,
        takeParsed,
      );
    } catch (e) {
      throw mapError(e);
    }
  }

  private parsePagingParams(skip: string, take: string) {
    let skipParsed: number = skip ? parseInt(skip) : 0;
    let takeParsed: number = take ? parseInt(take) : 100;
    if (
      Number.isNaN(skipParsed) ||
      skipParsed < 0 ||
      skipParsed > Number.MAX_SAFE_INTEGER
    ) {
      skipParsed = 0;
    }
    if (
      Number.isNaN(takeParsed) ||
      takeParsed < 1 ||
      takeParsed > TriggeredAlertHistoryController.MAX_RECORDS
    ) {
      takeParsed = TriggeredAlertHistoryController.MAX_RECORDS;
    }
    return { skipParsed, takeParsed };
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
