import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  AuthenticationRequest,
  AuthenticationService,
  UserResponse,
} from '../../api-client';
import { HttpBackend } from '@angular/common/http';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class UserAuthservice {
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenService = inject(TokenService);
  private authService = inject(AuthenticationService);
  http = inject(HttpBackend);
  private effectivePermissions = new Set<string>();
  constructor() {
    this.loadUserFromToken();
  }
  login(credentials: AuthenticationRequest): Observable<any> {
    return this.authService.login(credentials).pipe(
      tap((response: any) => {
        this.tokenService.saveToken(response.token!);
        this.loadUserFromToken();
      })
    );
  }
  logout() {
    this.tokenService.removeToken();
    this.currentUserSubject.next(null);
    this.effectivePermissions.clear();
  }
  getToken(): string | null {
    return this.tokenService.getToken();
  }
  isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }

  private loadUserFromToken(): void {
    try {
      const decodeToken: any = this.tokenService.decodeToken();
      if (!decodeToken) {
        this.logout();
        return;
      }
      const tokenUser = decodeToken.fullUser ?? decodeToken;
      const tokenRoles = tokenUser.roles ?? decodeToken.roles ?? [];
      const user: UserResponse = {
        id: tokenUser.id ?? decodeToken.id,
        username: tokenUser.username ?? decodeToken.sub,
        firstname: tokenUser.firstname ?? decodeToken.firstname,
        lastname: tokenUser.lastname ?? decodeToken.lastname,
        email: tokenUser.email ?? decodeToken.email,
        lastModifiedDate: tokenUser.lastModifiedDate ?? decodeToken.lastModifiedDate,
        createdDate: tokenUser.createdDate ?? decodeToken.createdDate,
        roles: tokenRoles.map((role: any) => ({
          id: role.id,
          nomRole: role.nomRole,
          descriptionRole: role.descriptionRole,
          permission: new Set(
            (role.permission ?? role.permissions ?? []).map((perm: any) => ({
              id: perm.id,
              nomPermission: perm.nomPermission,
              descriptionPermission: perm.descriptionPermission,
              module: perm.module,
              canRead: perm.canRead,
              canWrite: perm.canWrite,
              canEdit: perm.canEdit,
              canDelete: perm.canDelete,
              authority: perm.authority,
            }))
          ),
        })),
      };
      this.currentUserSubject.next(user);
      this.effectivePermissions = this.buildPermissionSet(tokenRoles);
    } catch (error) {
      console.error('Failed to load user from token.', error);
      this.logout();
    }
  }
  private buildPermissionSet(roles: any[]): Set<string> {
    const permissions = new Set<string>();
    roles.forEach((role) => {
      const rolePerms = role.permission ?? role.permissions ?? [];
      rolePerms.forEach((perm: any) => {
        const authority = (perm.authority ?? '').toString().trim().toUpperCase();
        if (authority) {
          permissions.add(authority);
        }
        const module = (perm.module ?? '').toString().trim();
        if (!module) {
          const name = (perm.nomPermission ?? '').toString().trim().toUpperCase();
          if (name) {
            permissions.add(name);
          }
          return;
        }
        const moduleKey = module.replace(/\s+/g, '_').toUpperCase();
        if (perm.canRead) permissions.add(`READ_${moduleKey}`);
        if (perm.canWrite) permissions.add(`WRITE_${moduleKey}`);
        if (perm.canEdit) permissions.add(`EDIT_${moduleKey}`);
        if (perm.canDelete) permissions.add(`DELETE_${moduleKey}`);
      });
    });
    return permissions;
  }
  hasPermission(permissionCode: string): boolean {
    if (!permissionCode) return false;
    const code = permissionCode.toUpperCase();
    return this.effectivePermissions.has(code);
  }
  hasAnyPermission(permissionCodes: string[]): boolean {
    if (!permissionCodes || permissionCodes.length === 0) return true;
    return permissionCodes.some((code) => this.hasPermission(code));
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.getValue();
    if (!user || !user.roles) return false;
    return user.roles.some((role: any) => 
      role.nomRole?.toUpperCase() === 'ROLE_ADMIN' || 
      role.nomRole?.toUpperCase() === 'ADMIN'
    );
  }
}
