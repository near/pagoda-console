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

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('getAccountDetails')
  @UseGuards(BearerAuthGuard)
  async getAccountDetails(@Request() req) {
    const { uid, email, name, photoUrl } = req.user;
    return { uid, email, name, photoUrl };
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

  // TODO decide on the best UX for when a new DC user is sent an invite.
  // 1. We could unguard this route, allow a user to accept the invite and then require that they login/signup with a notification on the login screen that tells the user to create an account or login with some_email@gmail.com
  // 2. Leave this route guarded, require user to login/signup, do a query to see if they have some org invites and take them to a screen to accept org invitation. We can cache the org invitation in the browser while they signup so we can save a query.
  @Post('acceptOrgInvite')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(AcceptOrgInviteSchema))
  async acceptOrgInvite(
    @Request() req,
    @Body() { token }: AcceptOrgInviteDto,
  ): Promise<void> {
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
    case UserError.ORG_INVITE_EXPIRED:
    case UserError.ORG_INVITE_ALREADY_MEMBER:
    case UserError.BAD_ORG_INVITE:
    case UserError.BAD_ORG_PERSONAL:
    case UserError.ORG_FINAL_ADMIN:
    case UserError.BAD_USER:
      // 400: exposes error code to client
      return new BadRequestException(code);
    case UserError.NAME_CONFLICT:
      return new ConflictException(code);
    case UserError.SERVER_ERROR:
      return e;
    default:
      const _exhaustiveCheck: never = code;
      return _exhaustiveCheck;
  }
}
