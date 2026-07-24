import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { OrganizationsService } from './organizations.service.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { OrgScopeGuard } from '../auth/org-scope.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

class UpdateOrgDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  settings?: Record<string, unknown>;
}

class UpdateMemberDto {
  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  disabled?: boolean;
}

class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsString()
  role!: string;
}

class AcceptInvitationDto {
  @IsString()
  token!: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  fullName?: string;
}

// ── Public endpoints (no auth) ──

@Controller()
export class PublicInvitationsController {
  constructor(private orgService: OrganizationsService) {}

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.orgService.acceptInvitation(dto.token, dto.password, dto.fullName);
  }
}

// ── Authenticated endpoints ──

@Controller()
@UseGuards(AuthGuard('jwt'), OrgScopeGuard)
export class OrganizationsController {
  constructor(private orgService: OrganizationsService) {}

  @Get('organization')
  async getOrganization(@CurrentUser() user: { orgId: string }) {
    return this.orgService.getOrganization(user.orgId);
  }

  @Patch('organization')
  async updateOrganization(
    @CurrentUser() user: { orgId: string },
    @Body() dto: UpdateOrgDto,
  ) {
    return this.orgService.updateOrganization(user.orgId, dto);
  }

  @Get('members')
  @Roles('admin', 'project_manager')
  @UseGuards(RolesGuard)
  async getMembers(@CurrentUser() user: { orgId: string }) {
    return this.orgService.getMembers(user.orgId);
  }

  @Patch('members/:userId')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async updateMember(
    @CurrentUser() user: { orgId: string },
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.orgService.updateMemberRole(user.orgId, userId, dto);
  }

  @Post('invitations')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(
    @CurrentUser() user: { orgId: string; id: string },
    @Body() dto: CreateInvitationDto,
  ) {
    return this.orgService.createInvitation(user.orgId, dto.email, dto.role, user.id);
  }

  @Delete('invitations/:id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async revokeInvitation(
    @CurrentUser() user: { orgId: string },
    @Param('id') id: string,
  ) {
    return this.orgService.revokeInvitation(user.orgId, id);
  }
}
