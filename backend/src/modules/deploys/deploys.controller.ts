import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
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
const patchDeploymentFrontendUrlInput = z
  .strictObject({
    repoDeploymentSlug: z.string(),
    packageName: z.string(),
    frontendDeployUrl: z.string().url().optional(),
    cid: z.string().optional(),
  })
  .refine(
    (data) => !!data.frontendDeployUrl || !!data.cid,
    'Either frontendDeployUrl or cid should be filled in.',
  );

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
  @UseGuards(BearerAuthGuard)
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

    // called from Console frontend to initialize a new repo for deployment
    return this.deploysService.deployRepository({
      githubRepoFullName,
      commitHash,
      commitMessage,
      files,
    });
  }

  @Post('addFrontend')
  @UsePipes(new ZodValidationPipe(patchDeploymentFrontendUrlInput))
  @UseGuards(BearerAuthGuard)
  async addFrontend(
    @Req() req: Request,
    @Body()
    {
      repoDeploymentSlug,
      frontendDeployUrl,
      cid,
      packageName,
    }: z.infer<typeof patchDeploymentFrontendUrlInput>,
  ) {
    const repoDeployment = await this.deploysService.getRepoDeploymentBySlug(
      repoDeploymentSlug,
    );
    if (!repoDeployment) {
      throw new BadRequestException(
        `RepoDeployment slug ${repoDeploymentSlug} not found`,
      );
    }

    return this.deploysService.addFrontend({
      repositorySlug: repoDeployment.repositorySlug,
      frontendDeployUrl,
      cid,
      packageName,
      repoDeploymentSlug,
    });
  }
}
