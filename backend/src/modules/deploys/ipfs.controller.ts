import {
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Express } from 'express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { File, Web3Storage } from 'web3.storage';
import { GithubBasicAuthGuard } from '@/src/core/auth/github-basic-auth.guard';

@Controller('ipfs')
export class IPFSController {
  @Post('add')
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(GithubBasicAuthGuard) // Currently used only by github - can be extended to authorize other clients
  async add(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // TODO: move to env
    const web3SorageClient = new Web3Storage({
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE1Q0QyOTc0NURjNjdEMEEwNkM1RDU4RjM2OTFkRmMyMjU2NENjQzMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzAzNTk0ODM1MTUsIm5hbWUiOiJjb25zb2xlLXVwbG9hZHMifQ.hWTPrDb76g89uvDJNBjf1zXBTMQLXR9cmhWa0tHqxR8',
    });

    const fileObjs = files.map(
      (file) => new File([file.buffer], file.originalname),
    );

    const cid = await web3SorageClient.put(fileObjs);

    return { cid };
  }
}
