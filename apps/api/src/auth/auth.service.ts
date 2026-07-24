import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrganizationSeederService } from './organization-seeder.service.js';
import type { Prisma } from '@prisma/client';
import type { JwtPayload } from './jwt.strategy.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private orgSeeder: OrganizationSeederService,
  ) {}

  async register(email: string, password: string, fullName: string, organizationName: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (password.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters');
    }

    const passwordHash = await argon2.hash(password);

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: { email, passwordHash, fullName },
      });

      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      const org = await tx.organization.create({
        data: {
          slug: `${slug}-${uuidv4().slice(0, 8)}`,
          name: organizationName,
        },
      });

      const adminRole = await this.orgSeeder.seedRoles(tx, org.id);

      await tx.membership.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      return { user, org, role: adminRole.key };
    });

    const tokens = await this.generateTokens(result.user.id, result.user.email, result.org.id, result.role);

    return {
      user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName },
      organization: { id: result.org.id, name: result.org.name, slug: result.org.slug },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.disabledAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id, isActive: true },
      include: { role: true, organization: true },
    });

    if (!membership) {
      throw new UnauthorizedException('No active organization membership');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      membership.organizationId,
      membership.role.key,
    );

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const membership = await this.prisma.membership.findFirst({
      where: { userId: stored.user.id, isActive: true },
      include: { role: true },
    });

    if (!membership) {
      throw new UnauthorizedException('No active organization membership');
    }

    return this.generateTokens(
      stored.user.id,
      stored.user.email,
      membership.organizationId,
      membership.role.key,
    );
  }

  async logout(refreshToken: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      locale: user.locale,
      memberships: user.memberships.map(
        (m: { organizationId: string; organization: { name: string; slug: string }; role: { key: string } }) => ({
          organizationId: m.organizationId,
          organizationName: m.organization.name,
          organizationSlug: m.organization.slug,
          role: m.role.key,
        }),
      ),
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    orgId: string,
    role: string,
  ) {
    const payload: JwtPayload = { sub: userId, email, orgId, role };
    const accessToken = this.jwtService.sign(payload);

    const rawToken = randomBytes(48).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: expiry,
      },
    });

    return {
      accessToken,
      refreshToken: rawToken,
      expiresIn: 900,
    };
  }
}
