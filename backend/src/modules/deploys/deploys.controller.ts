import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { DeploysService } from './deploys.service';
import { ZodValidationPipe } from 'src/pipes/ZodValidationPipe';
// import { Deploys } from '@pc/common/types/core';
// import { Api } from '@pc/common/types/api';
import { User } from '@pc/database/clients/core';

import { BearerAuthGuard } from '@/src/core/auth/bearer-auth.guard';
import { Request } from 'express';
import { z } from 'zod';

/*
NOTE: to unblock functionality development, types in this file are
temporarily not hooked into shared API types. This will be refactored
later
*/

const addDeployInput = z.strictObject({
  githubRepoFullName: z.string().regex(/[\w\.\-]+\/[\w\.\-]+/), // matches <owner/repo> e.g. 'near/pagoda-console`
  projectName: z.string(),
});
const deployWasmInput = z.strictObject({
  githubRepoFullName: z.string().regex(/[\w\.\-]+\/[\w\.\-]+/), // matches <owner/repo> e.g. 'near/pagoda-console`
  commitHash: z.string(),
  commitMessage: z.string(),
  file: z.any(),
});

@Controller('deploys')
export class DeploysController {
  constructor(private readonly deploysService: DeploysService) {}

  @Post('addDeploy')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(addDeployInput))
  async addDeploy(
    @Req() req: Request,
    @Body()
    { githubRepoFullName, projectName }: z.infer<typeof addDeployInput>,
  ) {
    // called from Console frontend to initialize a new repo for deployment
    return await this.deploysService.createDeployProject({
      user: req.user as User, // TODO change to UserDetails from auth service
      githubRepoFullName,
      projectName,
    });
  }

  // TODO allow file uploads
  @Post('deployWasm')
  // @UseGuards(BearerAuthGuard) // TODO replace with github auth guard
  @UsePipes(new ZodValidationPipe(deployWasmInput))
  async deployWasm(
    @Req() req: Request,
    @Body()
    {
      githubRepoFullName,
      commitHash,
      commitMessage,
    }: z.infer<typeof deployWasmInput>,
  ) {
    // called from Console frontend to initialize a new repo for deployment
    return await this.deploysService.deployRepository({
      githubRepoFullName,
      commitHash,
      commitMessage,
    });
  }
}
