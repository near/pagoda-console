import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  Request,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ConflictException,
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
    try {
      // called from Console frontend to initialize a new repo for deployment
      const repository = await this.deploysService.createDeployProject({
        user: req.user as User, // TODO change to UserDetails from auth service
        githubRepoFullName,
        projectName,
      });
      return {
        repositorySlug: repository.slug,
        projectSlug: repository.projectSlug,
      };
    } catch (e: any) {
      throw mapError(e);
    }
  }
  @Post('isRepositoryTransferred')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Deploys.query.inputs.isRepositoryTransferred))
  async isRepoTransferred(
    @Req() req: ExpressRequest,
    @Body()
    {
      repositorySlug,
    }: z.infer<typeof Deploys.query.inputs.isRepositoryTransferred>,
  ): Promise<Api.Query.Output<'/deploys/isRepositoryTransferred'>> {
    try {
      return await this.deploysService.isRepositoryTransferred(
        req.user as User, // TODO change to UserDetails from auth service
        repositorySlug,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('transferGithubRepository')
  @UseGuards(BearerAuthGuard)
  @UsePipes(
    new ZodValidationPipe(Deploys.mutation.inputs.transferGithubRepository),
  )
  async transferGithubRepository(
    @Req() req: ExpressRequest,
    @Body()
    {
      repositorySlug,
      newGithubUsername,
    }: z.infer<typeof Deploys.mutation.inputs.transferGithubRepository>,
  ): Promise<Api.Mutation.Output<'/deploys/transferGithubRepository'>> {
    // called from Console frontend to initialize a new repo for deployment
    const repository = await this.deploysService.transferGithubRepository({
      user: req.user as User, // TODO change to UserDetails from auth service
      newGithubUsername,
      repositorySlug,
    });
    return {
      repositorySlug: repository.slug,
      githubRepoFullName: repository.githubRepoFullName,
    };
  }

  @Post('deployWasm')
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(GithubBasicAuthGuard) // Currently used only by github - can be extended to authorize other clients
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
    return this.deploysService.deployRepository({
      githubRepoFullName,
      commitHash,
      commitMessage,
      files,
    });
  }

  @Post('addNearSocialComponent')
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(GithubBasicAuthGuard) // Currently used only by github - can be extended to authorize other clients
  async addNearSocialComponent(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body()
    body: z.infer<typeof Deploys.mutation.inputs.deployNearSocialComponent>,
  ) {
    const parsedValue =
      Deploys.mutation.inputs.deployNearSocialComponent.safeParse(body);
    if (parsedValue.success === false) {
      throw new BadRequestException(fromZodError(parsedValue.error).toString());
    }

    const parsedFiles =
      Deploys.mutation.inputs.nearSocialFiles.safeParse(files);
    if (parsedFiles.success === false) {
      throw new BadRequestException(fromZodError(parsedFiles.error).toString());
    }
    const {
      componentName,
      componentDescription,
      componentIconIpfsCid,
      componentTags,
    } = body;
    return this.deploysService.addNearSocialComponentDeployment({
      repoDeploymentSlug: body.repoDeploymentSlug,
      metadata: {
        componentName,
        componentDescription,
        componentIconIpfsCid,
        componentTags,
      },
      file: files[0],
    });
  }

  @Post('addFrontend')
  @UsePipes(new ZodValidationPipe(Deploys.mutation.inputs.addFrontend))
  @UseGuards(GithubBasicAuthGuard) // Currently used only by github - can be extended to authorize other clients
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

    return this.deploysService.addFrontendDeployment({
      repositorySlug: repoDeployment.repositorySlug,
      frontendDeployUrl,
      cid,
      packageName,
      repoDeploymentSlug,
    });
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
  const code = errorInfo?.code;
  switch (code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'TOO_MANY_REQUESTS':
      return new TooManyRequestsException();
    case 'NAME_CONFLICT':
      return new ConflictException(code);
    case 'CONFLICT':
      return new ConflictException(code);
    default:
      return e;
  }
}
