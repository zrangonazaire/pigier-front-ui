import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService, Role, Permission } from './permission.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-permission-management',
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PermissionManagementComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];
  loading = false;
  error: string | null = null;

  // Suivi de l'état de sauvegarde pour chaque rôle
  savingStates: { [roleId: number]: boolean } = {};

  permissionService = inject(PermissionService);
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      permissions: this.permissionService.getPermissions(),
      roles: this.permissionService.getRoles()
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ permissions, roles }) => {
        this.permissions = permissions;
        this.roles = roles;
      },
      error: err => {
        this.handleError(err);
      
      },
    });
  }

  private handleError(err: any): void {
    this.error = 'Erreur lors de la récupération des données.';
    console.error(err);
    this.loading = false;
  }

  hasPermission(role: Role, permissionId: number): boolean {
    return role.permissions.includes(permissionId);
  }

  onPermissionChange(role: Role, permissionId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!role.permissions.includes(permissionId)) {
        role.permissions.push(permissionId);
      }
    } else {
      const index = role.permissions.indexOf(permissionId);
      if (index > -1) {
        role.permissions.splice(index, 1);
      }
    }
  }

  savePermissions(role: Role): void {
    this.savingStates[role.id] = true;
    this.error = null;
    this.permissionService.updateRolePermissions(role)
      .pipe(finalize(() => this.savingStates[role.id] = false))
      .subscribe({
        next: () => {
          // Optionnel: afficher un message de succès
        },
        error: err => {
          this.error = `Erreur lors de la sauvegarde pour le rôle ${role.name}.`;
          console.error(err);
          this.loadData(); // Recharger les données en cas d'erreur pour annuler les changements locaux
        }
      });
  }
}
