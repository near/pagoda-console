import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { DateTime } from 'luxon';
import { AppConfig } from 'src/config/validate';
import { VError } from 'verror';
import { PrismaService } from '../prisma.service';
import { Alerts } from '@pc/common/types/alerts';

@Injectable()
export class TelegramService {
  private botApi: AxiosInstance;

  constructor(
    private config: ConfigService<AppConfig>,
    private prisma: PrismaService,
  ) {
    const telegram = this.config.get('alerts.telegram', {
      infer: true,
    });
    const botToken = telegram?.botToken ?? '';

    this.botApi = axios.create({
      baseURL: `https://api.telegram.org/bot${botToken}`,
    });
  }

  async start(startToken: string | undefined, chat: Alerts.TgChat) {
    const tgDestination = await this.prisma.telegramDestination.findUnique({
      where: {
        startToken,
      },
      select: {
        id: true,
        tokenExpiresAt: true,
        destinationId: true,
      },
    });

    if (!tgDestination) {
      throw new VError(
        { info: { code: 'BAD_TELEGRAM_TOKEN' } },
        'Telegram destination not found for start token',
      );
    }

    //check token expiry
    if (DateTime.now() > DateTime.fromJSDate(tgDestination.tokenExpiresAt!)) {
      throw new VError(
        { info: { code: 'BAD_TELEGRAM_TOKEN_EXPIRED' } },
        'Telegram start token expired',
      );
    }

    const isGroupChat = chat.type !== 'private';

    await this.prisma.destination.update({
      where: {
        id: tgDestination.destinationId,
      },
      data: {
        isValid: true,
        telegramDestination: {
          update: {
            chatId: chat.id,
            startToken: null,
            tokenExpiresAt: null,
            isGroupChat,
            chatTitle: isGroupChat
              ? `Group: ${chat.title || chat.id}`
              : `@${chat.username || chat.id}`,
          },
        },
      },
    });
  }

  async sendMessage(chat_id, text) {
    try {
      await this.botApi.post('/sendMessage', {
        chat_id,
        text,
        parse_mode: 'HTML',
      });
    } catch (e) {
      console.error(`Failed to send telegram message`, e);
    }
  }
}
