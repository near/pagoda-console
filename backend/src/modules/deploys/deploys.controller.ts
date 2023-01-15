import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Request,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { DeploysService } from './deploys.service';
import { ZodValidationPipe } from 'src/pipes/ZodValidationPipe';
import { User } from '@pc/database/clients/core';
import { BearerAuthGuard } from '@/src/core/auth/bearer-auth.guard';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Deploys } from '@/../common/types/deploys';
import { Api } from '@pc/common/types/api';
import { GithubBasicAuthGuard } from '@/src/core/auth/github-basic-auth.guard';
import { TooManyRequestsException } from '../alerts/exception/tooManyRequestsException';
import { VError } from 'verror';
import { Request as ExpressRequest } from 'express';

@Controller('deploys')
export class DeploysController {
  constructor(private readonly deploysService: DeploysService) {}

  @Post('addDeploy')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Deploys.mutation.inputs.addDeploy))
  async addDeploy(
    @Req() req: ExpressRequest,
    @Body()
    {
      githubRepoFullName,
      projectName,
    }: z.infer<typeof Deploys.mutation.inputs.addDeploy>,
  ): Promise<Api.Mutation.Output<'/deploys/addDeploy'>> {
    // called from Console frontend to initialize a new repo for deployment
    const repository = await this.deploysService.createDeployProject({
      user: req.user as User, // TODO change to UserDetails from auth service
      githubRepoFullName,
      projectName,
    });
    return {
      repositorySlug: repository.slug,
    };
  }

  @Post('deployWasm')
  @HttpCode(204)
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(GithubBasicAuthGuard)
  async deployWasm(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: z.infer<typeof Deploys.mutation.inputs.deployWasm>,
  ) {
    const parsedValue = Deploys.mutation.inputs.deployWasm.safeParse(body);
    if (parsedValue.success === false) {
      throw new BadRequestException(fromZodError(parsedValue.error).toString());
    }

    const parsedFiles = Deploys.mutation.inputs.wasmFiles.safeParse(files);
    if (parsedFiles.success === false) {
      throw new BadRequestException(fromZodError(parsedFiles.error).toString());
    }
    const { githubRepoFullName, commitHash, commitMessage } = body;

    // called from Console frontend to initialize a new repo for deployment
    await this.deploysService.deployRepository({
      githubRepoFullName,
      commitHash,
      commitMessage,
      files,
    });

    // 204 no content
  }

  @Post('addFrontend')
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(Deploys.mutation.inputs.addFrontend))
  @UseGuards(GithubBasicAuthGuard)
  async addFrontend(
    @Req() req: Request,
    @Body()
    {
      repoDeploymentSlug,
      frontendDeployUrl,
      cid,
      packageName,
    }: z.infer<typeof Deploys.mutation.inputs.addFrontend>,
  ) {
    const repoDeployment = await this.deploysService.getRepoDeploymentBySlug(
      repoDeploymentSlug,
    );
    if (!repoDeployment) {
      throw new BadRequestException(
        `RepoDeployment slug ${repoDeploymentSlug} not found`,
      );
    }

    await this.deploysService.addFrontend({
      repositorySlug: repoDeployment.repositorySlug,
      frontendDeployUrl,
      cid,
      packageName,
      repoDeploymentSlug,
    });

    // 204 no content
  }

  @Post('listRepositories')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Deploys.query.inputs.listRepositories))
  async listRepositories(
    @Request() req,
    @Body()
    { project }: Api.Query.Input<'/deploys/listRepositories'>,
  ): Promise<Api.Query.Output<'/deploys/listRepositories'>> {
    try {
      return await this.deploysService.listRepositories(req.user, project);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('listDeployments')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Deploys.query.inputs.listDeployments))
  async listDeployments(
    @Request() req,
    @Body()
    { project }: Api.Query.Input<'/deploys/listDeployments'>,
  ): Promise<Api.Query.Output<'/deploys/listDeployments'>> {
    try {
      return await this.deploysService.listDeployments(req.user, project, 10);
    } catch (e: any) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  // TODO log in dev
  // console.error(e);
  const errorInfo = VError.info(e);
  switch (errorInfo?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'TOO_MANY_REQUESTS':
      return new TooManyRequestsException();
    default:
      return e;
  }
}
