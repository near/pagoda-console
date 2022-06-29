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
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { AppConfig } from 'src/config/validate';
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
  GetAlertDetailsSchema,
  GetAlertDetailsDto,
  ListDestinationDto,
  ListDestinationSchema,
  DeleteDestinationDto,
  DeleteDestinationSchema,
  AlertDetailsResponseDto,
  CreateDestinationDto,
  CreateDestinationSchema,
  DisableDestinationDto,
  DisableDestinationSchema,
  EnableDestinationDto,
  EnableDestinationSchema,
  UpdateDestinationSchema,
  UpdateDestinationDto,
} from './dto';
import { TelegramService } from './telegram/telegram.service';
import { TgUpdate } from './telegram/types';

@Controller('alerts')
export class AlertsController {
  private tgSecret: string;
  private tgEnableWebhook: boolean;
  constructor(
    private config: ConfigService<AppConfig>,
    private readonly alertsService: AlertsService,
    private readonly telegramService: TelegramService,
  ) {
    this.tgSecret = this.config.get('alerts.telegram.secret', { infer: true });
    this.tgEnableWebhook = this.config.get('alerts.telegram.enableWebhook', {
      infer: true,
    });
  }

  @Post('createAlert')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateAlertSchema))
  async createAlert(
    @Request() req,
    @Body() dto: CreateAlertDto,
  ): Promise<AlertDetailsResponseDto> {
    try {
      const ruleType = dto.type;
      switch (ruleType) {
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
          assertUnreachable(ruleType);
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
  ): Promise<AlertDetailsResponseDto> {
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
  ): Promise<AlertDetailsResponseDto[]> {
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
  async getAlertDetails(
    @Request() req,
    @Body() { id }: GetAlertDetailsDto,
  ): Promise<AlertDetailsResponseDto> {
    try {
      return await this.alertsService.getAlertDetails(req.user, id);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('createDestination')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateDestinationSchema))
  async createDestination(@Request() req, @Body() dto: CreateDestinationDto) {
    try {
      const type = dto.type;
      switch (type) {
        case 'WEBHOOK':
          return await this.alertsService.createWebhookDestination(
            req.user,
            dto,
          );
        case 'EMAIL':
          return await this.alertsService.createEmailDestination(req.user, dto);
        case 'TELEGRAM':
          return await this.alertsService.createTelegramDestination(
            req.user,
            dto,
          );
        default:
          assertUnreachable(type);
      }
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
    @Body() { projectSlug }: ListDestinationDto,
  ) {
    try {
      return await this.alertsService.listDestinations(req.user, projectSlug);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('enableDestination')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(EnableDestinationSchema))
  async enableDestination(
    @Request() req,
    @Body() { alert, destination }: EnableDestinationDto,
  ) {
    try {
      return await this.alertsService.enableDestination(
        req.user,
        alert,
        destination,
      );
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('disableDestination')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(DisableDestinationSchema))
  async disableDestination(
    @Request() req,
    @Body() { alert, destination }: DisableDestinationDto,
  ) {
    try {
      return await this.alertsService.disableDestination(
        req.user,
        alert,
        destination,
      );
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('updateDestination')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(UpdateDestinationSchema))
  async updateDestination(@Request() req, @Body() dto: UpdateDestinationDto) {
    try {
      const type = dto.type;
      switch (type) {
        case 'WEBHOOK':
          return await this.alertsService.updateWebhookDestination(
            req.user,
            dto,
          );
        case 'EMAIL':
          return await this.alertsService.updateEmailDestination(req.user, dto);
        case 'TELEGRAM':
          return await this.alertsService.updateTelegramDestination(
            req.user,
            dto,
          );
        default:
          assertUnreachable(type);
      }
    } catch (e) {
      throw mapError(e);
    }
  }

  // * Handler for Telegram bot, this is not an endpoint for the DevConsole frontend
  @Post('telegramWebhook')
  @HttpCode(200)
  async start(
    @Headers('X-Telegram-Bot-Api-Secret-Token') secret: string,
    @Body() body: TgUpdate,
  ) {
    if (!this.tgEnableWebhook) {
      throw new ForbiddenException();
    }

    if (secret !== this.tgSecret) {
      throw new UnauthorizedException();
    }
    const { message } = body;
    if (message && message.text) {
      if (message.text.startsWith('/start')) {
        const startToken = message.text.split(' ')[1];
        if (startToken) {
          try {
            await this.telegramService.start(startToken, message.chat.id);
          } catch (e) {
            // TODO convert this when logging lib is merged
            console.error(e); // intentionally leaving this in until better logging is implemented
            switch (VError.info(e)?.code) {
              case 'BAD_TELEGRAM_TOKEN':
                await this.telegramService.sendMessage(
                  message.chat.id,
                  `This token doesn't seem to be valid. Please check your destination in Pagoda DevConsole and try again`,
                );
                break;
              case 'BAD_TELEGRAM_TOKEN_EXPIRED':
                await this.telegramService.sendMessage(
                  // TODO direct user to rotate token once that functionality is available
                  message.chat.id,
                  // `This token is expired. Please obtain a new token on the Destination details page`,
                  `This token is expired. At the moment we do not support generating a new token. Please create a new destination`,
                );
                break;
              default:
                await this.telegramService.sendMessage(
                  message.chat.id,
                  `Sorry, something went wrong. Please try again later`,
                );
            }
            return;
          }
          await this.telegramService.sendMessage(
            message.chat.id,
            `This destination is ready to receive alerts!`,
          );
        } else {
          await this.telegramService.sendMessage(
            body.message.chat.id,
            `Please provide your setup token as follows:\n<pre>/start &lt;token&gt;</pre>`,
          );
        }
      } else {
        await this.telegramService.sendMessage(
          body.message.chat.id,
          'You can receive alerts here by setting up a Telegram destination in Pagoda DevConsole. If you are trying to provide your setup token, please enter it as follows:\n<pre>/start &lt;token&gt;</pre>',
        );
      }
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
