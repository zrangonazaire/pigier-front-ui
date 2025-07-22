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
  }
  getToken(): string | null {
    return this.tokenService.getToken();
  }
  isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }
    try {
      const decodeToken: any = this.tokenService.decodeToken();
      if (!decodeToken) {
        this.logout();
        return;
      }
      const user: UserResponse = {
        id: decodeToken.id,
        username: decodeToken.sub,
        firstname: decodeToken.firstname,
        lastname: decodeToken.lastname,
        email: decodeToken.email,
        lastModifiedDate: decodeToken.lastModifiedDate,
        createdDate: decodeToken.createdDate,
        roles: decodeToken.roles.map((role: any) => ({
          id: role.id,
          nomRole: role.nomRole,
          descriptionRole: role.descriptionRole,
          permission: new Set(
            role.permission.map((perm: any) => ({
              id: perm.id,
              nomPermission: perm.nomPermission,
              descriptionPermission: perm.descriptionPermission,
            }))
          ),
        })),
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Failed to load user from token.', error);
      this.logout();
    }
  }
  hasPermission(permissionCode: string): boolean {
    const user = this.currentUserSubject.getValue();
    if (!user?.roles) return false;
    return user.roles.some(
      (role) =>
        role.permission &&
        Array.from(role.permission).some(
          (perm) => perm.nomPermission === permissionCode
        )
    );
  }
  hasAnyPermission(permissionCodes: string[]): boolean {
    if (!permissionCodes || permissionCodes.length === 0) return true;
    return permissionCodes.some((code) => this.hasPermission(code));
  }
}
