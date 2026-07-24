import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { FormsModule } from './forms/forms.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';
import { AttachmentsModule } from './attachments/attachments.module.js';
import { SyncModule } from './sync/sync.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 300, // 300 requests per minute by default
      },
    ]),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    FormsModule,
    SubmissionsModule,
    AttachmentsModule,
    SyncModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
