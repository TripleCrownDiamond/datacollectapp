import { Module } from '@nestjs/common';
import { OrganizationsController, PublicInvitationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';

@Module({
  controllers: [OrganizationsController, PublicInvitationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
