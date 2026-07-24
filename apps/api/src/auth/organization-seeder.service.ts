import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

/**
 * Default roles with their key permissions.
 * Maps to the 8 roles defined in 10_DATABASE.md §6.
 */
const DEFAULT_ROLES: Array<{
  key: string;
  name: string;
  permissions: string[];
}> = [
  {
    key: 'super_admin',
    name: 'Super Administrator',
    permissions: ['admin.platform'],
  },
  {
    key: 'admin',
    name: 'Administrator',
    permissions: [
      'org.manage',
      'org.billing',
      'members.manage',
      'roles.manage',
      'projects.create',
      'projects.archive',
      'forms.create',
      'forms.publish',
      'submissions.review',
      'submissions.view_all',
      'data.export',
      'data.analyze',
      'ai.use',
      'dashboard.view',
      'collect',
    ],
  },
  {
    key: 'project_manager',
    name: 'Project Manager',
    permissions: [
      'projects.create',
      'projects.archive',
      'forms.create',
      'forms.publish',
      'submissions.review',
      'submissions.view_all',
      'data.export',
      'data.analyze',
      'ai.use',
      'dashboard.view',
      'collect',
    ],
  },
  {
    key: 'supervisor',
    name: 'Supervisor',
    permissions: [
      'submissions.review',
      'submissions.view_all',
      'data.export',
      'dashboard.view',
      'collect',
    ],
  },
  {
    key: 'quality_controller',
    name: 'Quality Controller',
    permissions: [
      'submissions.review',
      'submissions.view_all',
      'data.export',
      'dashboard.view',
    ],
  },
  {
    key: 'collector',
    name: 'Collector',
    permissions: ['collect', 'dashboard.view'],
  },
  {
    key: 'analyst',
    name: 'Analyst',
    permissions: [
      'submissions.view_all',
      'data.export',
      'data.analyze',
      'dashboard.view',
    ],
  },
  {
    key: 'observer',
    name: 'Observer',
    permissions: ['dashboard.view'],
  },
];

@Injectable()
export class OrganizationSeederService {
  async seedRoles(tx: Prisma.TransactionClient, orgId: string) {
    let adminRole: { id: string; key: string } | null = null;

    for (const roleDef of DEFAULT_ROLES) {
      const role = await tx.role.create({
        data: {
          organizationId: orgId,
          key: roleDef.key,
          name: roleDef.name,
          isPreset: true,
          permissions: {
            create: roleDef.permissions.map((p) => ({ permission: p })),
          },
        },
      });

      if (roleDef.key === 'admin') {
        adminRole = role;
      }
    }

    if (!adminRole) {
      throw new Error('Admin role not found in default roles');
    }

    return adminRole;
  }
}
