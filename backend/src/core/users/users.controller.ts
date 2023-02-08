import {
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
  UsePipes,
  Body,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { ZodValidationPipe } from '@/src/pipes/ZodValidationPipe';
import { Users } from '@pc/common/types/core';
import { VError } from 'verror';
import { UserError } from './user-error';
import { Api } from '@pc/common/types/api';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ! It is important this function is not extended to include any system data
  // ! since we allow it to be called by users who have not verified their email
  // ! address. All data here is simply extracted from the JWT passed in the
  // ! request
  @Post('getAccountDetails')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.query.inputs.getAccountDetails))
  async getAccountDetails(
    @Request() req,
    @Body() _: Api.Query.Input<'/users/getAccountDetails'>,
  ): Promise<Api.Query.Output<'/users/getAccountDetails'>> {
    const { uid, email, name, photoUrl } = req.user;
    return { uid, email, name, photoUrl };
  }

  // Gets a list of orgs that this user is the sole admin of.
  @Post('listOrgsWithOnlyAdmin')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.query.inputs.listOrgsWithOnlyAdmin))
  async listOrgsWithOnlyAdmin(
    @Request() req,
    @Body() _: Api.Query.Input<'/users/listOrgsWithOnlyAdmin'>,
  ): Promise<Api.Query.Output<'/users/listOrgsWithOnlyAdmin'>> {
    try {
      return await this.usersService.listOrgsWithOnlyAdmin(req.user.uid);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('deleteAccount')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.deleteAccount))
  async deleteAccount(
    @Request() req,
    @Body() _: Api.Mutation.Input<'/users/deleteAccount'>,
  ): Promise<Api.Mutation.Output<'/users/deleteAccount'>> {
    const { uid } = req.user;
    try {
      return await this.usersService.deactivateUser(uid);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('createOrg')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.createOrg))
  async create(
    @Request() req,
    @Body() { name }: Api.Mutation.Input<'/users/createOrg'>,
  ): Promise<Api.Mutation.Output<'/users/createOrg'>> {
    try {
      return await this.usersService.createOrg(req.user, name.trim());
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('inviteToOrg')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.inviteToOrg))
  async inviteToOrg(
    @Request() req,
    @Body() { org, email, role }: Api.Mutation.Input<'/users/inviteToOrg'>,
  ): Promise<Api.Mutation.Output<'/users/inviteToOrg'>> {
    try {
      return await this.usersService.inviteToOrg(req.user, org, email, role);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('acceptOrgInvite')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.acceptOrgInvite))
  async acceptOrgInvite(
    @Request() req,
    @Body() { token }: Api.Mutation.Input<'/users/acceptOrgInvite'>,
  ): Promise<Api.Mutation.Output<'/users/acceptOrgInvite'>> {
    try {
      return await this.usersService.acceptOrgInvite(req.user, token);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('listOrgMembers')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.query.inputs.listOrgMembers))
  async listOrgMembers(
    @Request() req,
    @Body() { org }: Api.Query.Input<'/users/listOrgMembers'>,
  ): Promise<Api.Query.Output<'/users/listOrgMembers'>> {
    try {
      return await this.usersService.listOrgMembers(req.user, org);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('listOrgs')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.query.inputs.listOrgs))
  async listOrgs(
    @Request() req,
    @Body() _: Api.Query.Input<'/users/listOrgs'>,
  ): Promise<Api.Query.Output<'/users/listOrgs'>> {
    try {
      return await this.usersService.listOrgs(req.user);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('deleteOrg')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.deleteOrg))
  async deleteOrg(
    @Request() req,
    @Body() { org }: Api.Mutation.Input<'/users/deleteOrg'>,
  ): Promise<Api.Mutation.Output<'/users/deleteOrg'>> {
    try {
      return await this.usersService.deleteOrg(req.user, org);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('changeOrgRole')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.changeOrgRole))
  async changeOrgRole(
    @Request() req,
    @Body() { org, user, role }: Api.Mutation.Input<'/users/changeOrgRole'>,
  ): Promise<Api.Mutation.Output<'/users/changeOrgRole'>> {
    try {
      return await this.usersService.changeOrgRole(req.user, org, user, role);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('removeFromOrg')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.removeFromOrg))
  async removeFromOrg(
    @Request() req,
    @Body() { org, user }: Api.Mutation.Input<'/users/removeFromOrg'>,
  ): Promise<Api.Mutation.Output<'/users/removeFromOrg'>> {
    try {
      return await this.usersService.removeFromOrg(req.user, org, user);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('removeOrgInvite')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.removeOrgInvite))
  async removeOrgInvite(
    @Request() req,
    @Body() { org, email }: Api.Mutation.Input<'/users/removeOrgInvite'>,
  ): Promise<Api.Mutation.Output<'/users/removeOrgInvite'>> {
    try {
      return await this.usersService.removeOrgInvite(req.user, org, email);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('resetPassword')
  @UsePipes(new ZodValidationPipe(Users.mutation.inputs.resetPassword))
  @HttpCode(204)
  async resetPassword(
    @Body() { email }: Api.Mutation.Input<'/users/resetPassword'>,
  ): Promise<Api.Mutation.Output<'/users/resetPassword'>> {
    try {
      await this.usersService.resetPassword(email);
    } catch (e: any) {
      throw mapError(e);
    }
  }
}

// choose which type of error response will be returned to the client
// based on the thrown code
//
// errors without a code will be mapped to SERVER_ERROR automatically
function mapError(e: Error) {
  let code: UserError = VError.info(e)?.code;
  if (!code) {
    code = UserError.SERVER_ERROR;
  }
  switch (code) {
    case UserError.PERMISSION_DENIED:
      return new ForbiddenException();
    case UserError.BAD_ORG:
    case UserError.MISSING_ORG_NAME:
    case UserError.ORG_INVITE_BAD_TOKEN:
    case UserError.ORG_INVITE_DUPLICATE:
    case UserError.ORG_INVITE_EMAIL_MISMATCH:
    case UserError.BAD_ORG_INVITE:
    case UserError.BAD_ORG_PERSONAL:
    case UserError.ORG_FINAL_ADMIN:
    case UserError.BAD_USER:
    case UserError.INVALID_EMAIL:
      // 400: exposes error code to client
      return new BadRequestException(code);
    case UserError.ORG_INVITE_EXPIRED:
    case UserError.ORG_INVITE_ALREADY_MEMBER:
      const org = VError.info(e)?.org;
      // 400: exposes error code to client and org info.
      return new BadRequestException({
        statusCode: 400,
        message: code,
        error: 'Bad Request',
        org,
      });
    case UserError.NAME_CONFLICT:
      return new ConflictException(code);
    case UserError.SERVER_ERROR:
      return e;
    default:
      const _exhaustiveCheck: never = code;
      return _exhaustiveCheck;
  }
}
