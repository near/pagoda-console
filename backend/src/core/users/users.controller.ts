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
import firebaseAdmin from 'firebase-admin';
import {
  AcceptOrgInviteDto,
  AcceptOrgInviteSchema,
  ChangeOrgRoleDto,
  ChangeOrgRoleSchema,
  CreateOrgDto,
  CreateOrgSchema,
  DeleteOrgDto,
  DeleteOrgSchema,
  InviteToOrgDto,
  InviteToOrgSchema,
  ListOrgMembersDto,
  ListOrgMembersSchema,
  OrgData,
  OrgMemberData,
  RemoveFromOrgDto,
  RemoveFromOrgSchema,
  RemoveOrgInviteDto,
  RemoveOrgInviteSchema,
} from './dto';
import { JoiValidationPipe } from '@/src/pipes/JoiValidationPipe';
import { VError } from 'verror';
import { UserError } from './user-error';
import { Org } from '@pc/database/clients/core';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ! It is important this function is not extended to include any system data
  // ! since we allow it to be called by users who have not verified their email
  // ! address. All data here is simply extracted from the JWT passed in the
  // ! request
  @Post('getAccountDetails')
  @UseGuards(BearerAuthGuard)
  async getAccountDetails(@Request() req) {
    const { uid, email, name, photoUrl } = req.user;
    return { uid, email, name, photoUrl };
  }

  // Gets a list of orgs that this user is the sole admin of.
  @Post('listOrgsWithOnlyAdmin')
  @UseGuards(BearerAuthGuard)
  async listOrgsWithOnlyAdmin(@Request() req) {
    try {
      return await this.usersService.listOrgsWithOnlyAdmin(req.user.uid);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('deleteAccount')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  async deleteAccount(@Request() req) {
    const { uid } = req.user;
    try {
      await this.usersService.deactivateUser(uid);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('createOrg')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateOrgSchema))
  async create(
    @Request() req,
    @Body() { name }: CreateOrgDto,
  ): Promise<OrgData> {
    try {
      return await this.usersService.createOrg(req.user, name.trim());
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('inviteToOrg')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(InviteToOrgSchema))
  async inviteToOrg(
    @Request() req,
    @Body() { org, email, role }: InviteToOrgDto,
  ): Promise<void> {
    try {
      return await this.usersService.inviteToOrg(req.user, org, email, role);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('acceptOrgInvite')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(AcceptOrgInviteSchema))
  async acceptOrgInvite(
    @Request() req,
    @Body() { token }: AcceptOrgInviteDto,
  ): Promise<{ org: Pick<Org, 'name' | 'slug'> }> {
    try {
      return await this.usersService.acceptOrgInvite(req.user, token);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('listOrgMembers')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(ListOrgMembersSchema))
  async listOrgMembers(
    @Request() req,
    @Body() { org }: ListOrgMembersDto,
  ): Promise<OrgMemberData[]> {
    try {
      return await this.usersService.listOrgMembers(req.user, org);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('listOrgs')
  @UseGuards(BearerAuthGuard)
  async listOrgs(@Request() req): Promise<OrgData[]> {
    try {
      return await this.usersService.listOrgs(req.user);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('deleteOrg')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(DeleteOrgSchema))
  async deleteOrg(
    @Request() req,
    @Body() { org }: DeleteOrgDto,
  ): Promise<void> {
    try {
      return await this.usersService.deleteOrg(req.user, org);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('changeOrgRole')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(ChangeOrgRoleSchema))
  async changeOrgRole(
    @Request() req,
    @Body() { org, user, role }: ChangeOrgRoleDto,
  ): Promise<OrgMemberData> {
    try {
      return await this.usersService.changeOrgRole(req.user, org, user, role);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('removeFromOrg')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(RemoveFromOrgSchema))
  async removeFromOrg(
    @Request() req,
    @Body() { org, user }: RemoveFromOrgDto,
  ): Promise<void> {
    try {
      return await this.usersService.removeFromOrg(req.user, org, user);
    } catch (e) {
      throw mapError(e);
    }
  }

  @Post('removeOrgInvite')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(RemoveOrgInviteSchema))
  async removeOrgInvite(
    @Request() req,
    @Body() { org, email }: RemoveOrgInviteDto,
  ): Promise<void> {
    try {
      return await this.usersService.removeOrgInvite(req.user, org, email);
    } catch (e) {
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
