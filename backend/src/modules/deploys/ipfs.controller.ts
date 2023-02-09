import {
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { File, Web3Storage } from 'web3.storage';
import { GithubBasicAuthGuard } from '@/src/core/auth/github-basic-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/src/config/validate';

@Controller('ipfs')
export class IPFSController {
  private web3StorageToken: string;
  constructor(private config: ConfigService<AppConfig>) {
    const { web3StorageToken } = this.config.get('gallery', {
      infer: true,
    })!;
    this.web3StorageToken = web3StorageToken;
  }

  @Post('add')
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(GithubBasicAuthGuard) // Currently used only by github - can be extended to authorize other clients
  async add(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // TODO: move to env
    const web3SorageClient = new Web3Storage({
      token: this.web3StorageToken,
    });

    const fileObjs = files.map(
      (file) => new File([file.buffer], file.originalname),
    );

    const cid = await web3SorageClient.put(fileObjs, {
      wrapWithDirectory: true,
    });

    return { cid };
  }
}
