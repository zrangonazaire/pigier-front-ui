import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PermissionsService } from '../../../api-client/api/permissions.service';
import { RolesService } from '../../../api-client/api/roles.service';
import { RoleRequest } from '../../../api-client';

// Définition des modèles de données
export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: number[]; // Tableau des IDs de permission (numériques)
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(
    private permissionsApiService: PermissionsService,
    private rolesApiService: RolesService
  ) { }

  getRoles(): Observable<Role[]> {
    return this.rolesApiService.listDesRoles().pipe(
      map(rolesResponse => {
        // The API might return a plain array or a wrapper object (e.g., for pagination).
        // This code handles both cases gracefully.
        const rolesList: any[] = Array.isArray(rolesResponse) ? rolesResponse : (rolesResponse as any)?.content;

        if (!Array.isArray(rolesList)) {
          console.error('La réponse de l\'API pour les rôles n\'est pas un tableau et n\'a pas de propriété `content`. Réponse reçue:', rolesResponse);
          return []; // Retourne un tableau vide pour éviter les erreurs.
        }

        return rolesList
          .filter(roleRes => roleRes.id != null && roleRes.nomRole != null)
          .map(roleRes => {
            // Safely map permissions to their IDs
            const permissionIds = (roleRes.permissions && Array.isArray(roleRes.permissions))
              ? roleRes.permissions.map((p: any) => p.id).filter((id: any): id is number => id != null)
              : [];

            return {
              id: roleRes.id!,
              name: roleRes.nomRole!,
              description: roleRes.descriptionRole,
              permissions: permissionIds
            };
          });
      })
    );
  }

  getPermissions(): Observable<Permission[]> {
    return this.permissionsApiService.getAllPermissions().pipe(
      map(permissionsResponse => {
        // This is the fix for the TypeError. The API is likely not returning an array.
        if (!Array.isArray(permissionsResponse)) {
          console.error('Expected permissionsResponse to be an array, but received:', permissionsResponse);
          // Returning an empty array prevents the '.filter is not a function' error.
          // You may need to inspect the console output and adjust this line if the array is nested,
          // for example: `return (permissionsResponse as any)?.permissions || [];`
          return [];
        }
        return permissionsResponse
          .filter(permRes => permRes.id != null && permRes.nomPermission != null)
          .map(permRes => ({
            id: permRes.id!,
            name: permRes.nomPermission!,
            description: permRes.descriptionPermission
          }));
      })
    );
  }

  updateRolePermissions(role: Role): Observable<any> {
    const roleRequest: RoleRequest = {
      nomRole: role.name,
      descriptionRole: role.description,
      permissionIds: new Set(role.permissions)
    };
    return this.rolesApiService.updateRole(role.id, roleRequest);
  }
}