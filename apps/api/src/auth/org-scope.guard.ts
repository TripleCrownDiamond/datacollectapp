import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Ensures the user's JWT orgId is available on the request.
 * Scopes all database queries to the organization context.
 */
@Injectable()
export class OrgScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;
    if (!user.orgId) return false;

    // Attach orgId to request for downstream use
    request.orgId = user.orgId;
    return true;
  }
}
