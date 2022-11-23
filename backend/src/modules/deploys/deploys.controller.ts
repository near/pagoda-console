import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ForbiddenException,
} from '@nestjs/common';
import { DeploysService } from './deploys.service';
import { ZodValidationPipe } from 'src/pipes/ZodValidationPipe';
// import { Deploys } from '@pc/common/types/core';
// import { Api } from '@pc/common/types/api';
import { User } from '@pc/database/clients/core';

import { BearerAuthGuard } from '@/src/core/auth/bearer-auth.guard';
import { Request, Express } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

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
});
const wasmFilesInput = z.array(
  z.object({ mimetype: z.string().startsWith('application/wasm') }),
);
const patchDeploymentFrontendUrlInput = z.strictObject({
  repoDeploymentSlug: z.string(),
  frontendDeployUrl: z.string().url(),
});

// TODO
// add GET endpoints to view this data
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
    return this.deploysService.createDeployProject({
      user: req.user as User, // TODO change to UserDetails from auth service
      githubRepoFullName,
      projectName,
    });
  }

  @Post('deployWasm')
  @UseInterceptors(AnyFilesInterceptor())
  async deployWasm(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: z.infer<typeof deployWasmInput>,
  ) {
    const parsedValue = deployWasmInput.safeParse(body);
    if (parsedValue.success === false) {
      throw new BadRequestException(fromZodError(parsedValue.error).toString());
    }

    const parsedFiles = wasmFilesInput.safeParse(files);
    if (parsedFiles.success === false) {
      throw new BadRequestException(fromZodError(parsedFiles.error).toString());
    }
    const { githubRepoFullName, commitHash, commitMessage } = body;

    // auth guard code
    const authorized = await fetch(
      `https://api.github.com/repos/${githubRepoFullName}`,
      {
        headers: { Authorization: req.headers['x-github-token'] as string },
      },
    ).then((res) => /\brepo\b/.test(res.headers.get('x-oauth-scopes') || ''));
    if (!authorized) {
      throw new ForbiddenException('Unauthorized github token');
    }
    //

    // called from Console frontend to initialize a new repo for deployment
    return this.deploysService.deployRepository({
      githubRepoFullName,
      commitHash,
      commitMessage,
      files,
    });
  }

  @Patch('setFrontendDeployUrl')
  @UsePipes(new ZodValidationPipe(patchDeploymentFrontendUrlInput))
  async setFrontendDeployUrl(
    @Req() req: Request,
    @Body()
    {
      repoDeploymentSlug,
      frontendDeployUrl,
    }: z.infer<typeof patchDeploymentFrontendUrlInput>,
  ) {
    // auth guard code
    const repoDeployment = await this.deploysService.getRepoDeploymentBySlug(
      repoDeploymentSlug,
    );
    if (!repoDeployment) {
      throw new BadRequestException(
        `RepoDeployment slug ${repoDeploymentSlug} not found`,
      );
    }
    const authorized = await fetch(
      `https://api.github.com/repos/${repoDeployment.repository.githubRepoFullName}`,
      {
        headers: { Authorization: req.headers['x-github-token'] as string },
      },
    ).then((res) => /\brepo\b/.test(res.headers.get('x-oauth-scopes') || ''));
    if (!authorized) {
      throw new ForbiddenException('Unauthorized github token');
    }
    //

    return this.deploysService.setFrontendDeployUrl({
      repoDeploymentSlug,
      frontendDeployUrl,
    });
  }
}
