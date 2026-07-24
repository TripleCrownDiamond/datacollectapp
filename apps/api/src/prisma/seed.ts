/**
 * TerraCollect database seed script.
 *
 * Usage: pnpm db:seed
 * Requires: running database with migrations applied.
 *
 * Seeds:
 *   - 1 Organization: "Green Earth Initiative"
 *   - 1 Admin user (owner)
 *   - 1 Collector user
 *   - 1 Observer user
 *   - All 8 default roles with permissions
 *   - 1 Project: "Reforestation Mopti"
 *   - 1 Form: "Suivi des plantations" with draft schema
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

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

const DEMO_FORM_SCHEMA = {
  version: 1,
  defaultLanguage: 'fr',
  languages: ['fr', 'en'],
  settings: { displayMode: 'step' },
  children: [
    {
      type: 'section',
      name: 'identification',
      label: { fr: 'Identification', en: 'Identification' },
      children: [
        {
          type: 'text',
          name: 'enqueteur',
          label: { fr: "Nom de l'enquêteur", en: 'Enumerator name' },
          required: true,
        },
        {
          type: 'text',
          name: 'village',
          label: { fr: 'Village / Localité', en: 'Village / Locality' },
          required: true,
        },
        {
          type: 'select_one',
          name: 'type_plantation',
          label: { fr: 'Type de plantation', en: 'Plantation type' },
          required: true,
          options: [
            { name: 'manguier', label: { fr: 'Manguier', en: 'Mango' } },
            { name: 'acacia', label: { fr: 'Acacia', en: 'Acacia' } },
            { name: 'teck', label: { fr: 'Teck', en: 'Teak' } },
            { name: 'mixte', label: { fr: 'Mixte', en: 'Mixed' } },
            { name: 'autre', label: { fr: 'Autre', en: 'Other' } },
          ],
        },
        {
          type: 'geopoint',
          name: 'position',
          label: { fr: 'Position GPS', en: 'GPS position' },
          required: true,
          params: { minAccuracyM: 10 },
        },
      ],
    },
    {
      type: 'section',
      name: 'mesures',
      label: { fr: 'Mesures', en: 'Measurements' },
      relevance: "${type_plantation} != ''",
      children: [
        {
          type: 'integer',
          name: 'nb_arbres',
          label: { fr: "Nombre d'arbres plantés", en: 'Number of planted trees' },
          required: true,
          constraints: { min: 1, max: 10000 },
        },
        {
          type: 'decimal',
          name: 'superficie',
          label: { fr: 'Superficie (ha)', en: 'Area (ha)' },
          required: true,
          constraints: { min: 0.01, max: 100 },
        },
        {
          type: 'calculate',
          name: 'densite',
          label: { fr: 'Densité (arbres/ha)', en: 'Density (trees/ha)' },
          calculation: '${nb_arbres} / ${superficie}',
        },
        {
          type: 'photo',
          name: 'photo_plantation',
          label: { fr: 'Photo de la plantation', en: 'Plantation photo' },
          required: true,
        },
      ],
    },
    {
      type: 'repeat',
      name: 'especes',
      label: { fr: 'Espèces rencontrées', en: 'Species encountered' },
      children: [
        {
          type: 'text',
          name: 'nom_espece',
          label: { fr: "Nom de l'espèce", en: 'Species name' },
          required: true,
        },
        {
          type: 'integer',
          name: 'quantite',
          label: { fr: 'Quantité estimée', en: 'Estimated quantity' },
          constraints: { min: 1 },
        },
      ],
    },
    {
      type: 'note',
      name: 'note_fin',
      label: {
        fr: 'Merci ! La plantation a été enregistrée.',
        en: 'Thank you! The plantation has been recorded.',
      },
    },
  ],
};

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. Create users ──
  const adminPassword = await argon2.hash('password123456'); // min 12 chars
  const collectorPassword = await argon2.hash('collector123456');
  const observerPassword = await argon2.hash('observer123456');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@terracollect.dev' },
    update: {},
    create: {
      email: 'admin@terracollect.dev',
      passwordHash: adminPassword,
      fullName: 'Aïcha Diallo',
      locale: 'fr',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`  ✅ Admin user: ${adminUser.email}`);

  const collectorUser = await prisma.user.upsert({
    where: { email: 'collector@terracollect.dev' },
    update: {},
    create: {
      email: 'collector@terracollect.dev',
      passwordHash: collectorPassword,
      fullName: 'Moussa Traoré',
      locale: 'fr',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`  ✅ Collector user: ${collectorUser.email}`);

  const observerUser = await prisma.user.upsert({
    where: { email: 'observer@terracollect.dev' },
    update: {},
    create: {
      email: 'observer@terracollect.dev',
      passwordHash: observerPassword,
      fullName: 'Dr. Keita',
      locale: 'fr',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`  ✅ Observer user: ${observerUser.email}`);

  // ── 2. Create organization ──
  const org = await prisma.organization.upsert({
    where: { slug: 'green-earth-initiative' },
    update: {},
    create: {
      slug: 'green-earth-initiative',
      name: 'Green Earth Initiative',
      plan: 'free',
      settings: { ai_enabled: false },
    },
  });
  console.log(`  ✅ Organization: ${org.name}`);

  // ── 3. Create roles and permissions ──
  const roleMap = new Map<string, { id: string; key: string }>();

  for (const roleDef of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: {
        organizationId_key: { organizationId: org.id, key: roleDef.key },
      },
      update: { name: roleDef.name },
      create: {
        organizationId: org.id,
        key: roleDef.key,
        name: roleDef.name,
        isPreset: true,
        permissions: {
          create: roleDef.permissions.map((p) => ({ permission: p })),
        },
      },
    });
    roleMap.set(roleDef.key, { id: role.id, key: role.key });
  }
  console.log(`  ✅ Roles seeded: ${DEFAULT_ROLES.length}`);

  // ── 4. Create memberships ──
  await prisma.membership.upsert({
    where: {
      organizationId_userId: { organizationId: org.id, userId: adminUser.id },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: adminUser.id,
      roleId: roleMap.get('admin')!.id,
      isActive: true,
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: collectorUser.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: collectorUser.id,
      roleId: roleMap.get('collector')!.id,
      isActive: true,
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: observerUser.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: observerUser.id,
      roleId: roleMap.get('observer')!.id,
      isActive: true,
    },
  });
  console.log('  ✅ Memberships created');

  // ── 5. Create project ──
  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      organizationId: org.id,
      name: 'Reforestation Mopti',
      description:
        'Suivi des campagnes de reforestation dans la région de Mopti, Mali.',
      status: 'active',
      languages: ['fr', 'en'],
      timezone: 'Africa/Bamako',
      settings: {
        gps_accuracy_m: 10,
        photo_max_px: 2048,
        attachment_max_mb: 25,
        approval_required: false,
      },
      createdById: adminUser.id,
    },
  });
  console.log(`  ✅ Project: ${project.name}`);

  // ── 6. Create form with draft schema ──
  const form = await prisma.form.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: org.id,
      projectId: project.id,
      name: 'Suivi des plantations',
      status: 'draft',
      draftSchema: DEMO_FORM_SCHEMA as any,
      createdById: adminUser.id,
    },
  });
  console.log(`  ✅ Form: ${form.name} (draft)`);

  console.log('\n📋 Seed completed!');
  console.log('\n🔑 Demo accounts:');
  console.log('   Admin:     admin@terracollect.dev / password123456');
  console.log('   Collector: collector@terracollect.dev / collector123456');
  console.log('   Observer:  observer@terracollect.dev / observer123456');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
