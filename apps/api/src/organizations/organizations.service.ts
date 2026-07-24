import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async getOrganization(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org || org.deletedAt) {
      throw new NotFoundException('Organization not found');
    }

    const memberCount = await this.prisma.membership.count({
      where: { organizationId: orgId, isActive: true },
    });

    const projectCount = await this.prisma.project.count({
      where: { organizationId: orgId, deletedAt: null },
    });

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      settings: org.settings as Prisma.InputJsonValue,
      memberCount,
      projectCount,
      createdAt: org.createdAt,
    };
  }

  async updateOrganization(orgId: string, data: { name?: string; settings?: Record<string, unknown> }) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org || org.deletedAt) {
      throw new NotFoundException('Organization not found');
    }

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.settings && { settings: data.settings as Prisma.InputJsonValue }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      plan: updated.plan,
      settings: updated.settings,
    };
  }

  async getMembers(orgId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, disabledAt: true },
        },
        role: {
          select: { key: true, name: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return memberships.map(
      (m: {
        userId: string;
        user: { id: string; email: string; fullName: string; disabledAt: Date | null };
        role: { key: string; name: string };
        isActive: boolean;
        joinedAt: Date;
      }) => ({
        userId: m.userId,
        email: m.user.email,
        fullName: m.user.fullName,
        role: m.role.key,
        roleName: m.role.name,
        isActive: m.isActive,
        joinedAt: m.joinedAt,
        isDisabled: !!m.user.disabledAt,
      }),
    );
  }

  async updateMemberRole(orgId: string, userId: string, data: { role?: string; disabled?: boolean }) {
    const membership = await this.prisma.membership.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      include: { role: true },
    });

    if (!membership) {
      throw new NotFoundException('Member not found in this organization');
    }

    const updateData: Record<string, unknown> = {};

    if (data.role) {
      const targetRole = await this.prisma.role.findUnique({
        where: { organizationId_key: { organizationId: orgId, key: data.role } },
      });

      if (!targetRole) {
        throw new BadRequestException(`Role '${data.role}' not found`);
      }

      updateData.roleId = targetRole.id;
    }

    if (data.disabled !== undefined) {
      updateData.isActive = !data.disabled;

      await this.prisma.user.update({
        where: { id: userId },
        data: { disabledAt: data.disabled ? new Date() : null },
      });
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.membership.update({
        where: { organizationId_userId: { organizationId: orgId, userId } },
        data: updateData,
      });
    }

    return { message: 'Member updated successfully' };
  }

  async createInvitation(orgId: string, email: string, roleKey: string, invitedByUserId: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMembership = await this.prisma.membership.findUnique({
        where: { organizationId_userId: { organizationId: orgId, userId: existingUser.id } },
      });
      if (existingMembership) {
        throw new ConflictException('User is already a member of this organization');
      }
    }

    const role = await this.prisma.role.findUnique({
      where: { organizationId_key: { organizationId: orgId, key: roleKey } },
    });
    if (!role) {
      throw new BadRequestException(`Role '${roleKey}' not found`);
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId: orgId,
        email,
        roleKey,
        token,
        expiresAt,
        createdById: invitedByUserId,
      },
    });

    return {
      id: invitation.id,
      email: invitation.email,
      role: roleKey,
      expiresAt: invitation.expiresAt,
      invitationLink: `${process.env.APP_URL || 'http://localhost:3000'}/invitations/${token}`,
    };
  }

  async acceptInvitation(token: string, password?: string, fullName?: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { token } });

    if (!invitation || invitation.acceptedAt) {
      throw new BadRequestException('Invalid or already accepted invitation');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    let user = await this.prisma.user.findUnique({ where: { email: invitation.email } });

    if (!user) {
      if (!password || !fullName) {
        throw new BadRequestException('Password and full name required for new users');
      }
      const { hash } = await import('argon2');
      const passwordHash = await hash(password);
      user = await this.prisma.user.create({
        data: { email: invitation.email, passwordHash, fullName },
      });
    }

    const role = await this.prisma.role.findUnique({
      where: { organizationId_key: { organizationId: invitation.organizationId, key: invitation.roleKey } },
    });
    if (!role) throw new BadRequestException('Role not found');

    await this.prisma.membership.create({
      data: {
        organizationId: invitation.organizationId,
        userId: user.id,
        roleId: role.id,
        invitedBy: invitation.createdById,
      },
    });

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return { message: 'Invitation accepted successfully', organizationId: invitation.organizationId };
  }

  async revokeInvitation(orgId: string, invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, organizationId: orgId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.invitation.delete({ where: { id: invitationId } });
    return { message: 'Invitation revoked' };
  }
}
