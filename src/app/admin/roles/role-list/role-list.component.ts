import {
  Component,
  EventEmitter,
  Inject,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  Signal,
} from '@angular/core';
import {
  PermissionRequest,
  PermissionResponse,
  PermissionsService,
  RoleRequest,
  RoleResponse,
  RolesService,
  URole,
  UtilisateurControllerService,
} from '../../../../api-client';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { MenuComponent } from '../../../components/menu/menu.component';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../../users/user-list/user-list.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    TagModule,
    TableModule,
    MenuComponent,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    UserListComponent
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  @Input() isEditMode = false;
  @Input() permissionData?: PermissionRequest;
  @Output() submitFormPerm = new EventEmitter<PermissionRequest>();
  @Output() cancelFormPerm = new EventEmitter<void>();
  toastService = inject(ToastrService);

  permissionForm!: FormGroup;
  submitted = false;

  availableModules = [
    'PREINSCIPTION',
    'COMPTABILITE',
    'COMMERCIALE',
    'EXAMEN',
    'NOTE',
    'ELEVE',

  ];
  accessRights = [
    { key: 'canRead', label: 'Lecture' },
    { key: 'canWrite', label: 'Écriture' },
    { key: 'canEdit', label: 'Modification' },
    { key: 'canDelete', label: 'Suppression' },
  ];

  // Custom validator pour vérifier qu'au moins un droit est sélectionné
  atLeastOneRightValidator(group: FormGroup) {
    const hasRight = Object.keys(group.controls)
      .filter((key) => key.startsWith('can'))
      .some((key) => group.get(key)?.value);

    return hasRight ? null : { noRightsSelected: true };
  }

  // Getter pratique pour accéder aux contrôles du formulaire
  get f() {
    return this.permissionForm.controls;
  }

  onSubmitPerm(): void {
    this.submitted = true;

    if (this.permissionForm.invalid) {
      return;
    }

    this.submitPermissionForm();

    this.showPermissionForm = false;
    this.isEditMode = false;
    this.permissionForm.reset();
  }

  onCancelPerm(): void {
    this.cancelFormPerm.emit();
    this.showPermissionForm = false;
    this.isEditMode = false;
    this.permissionForm.reset();
  }
  submitPermissionForm(): void {
    if (this.permissionForm.invalid) return;

    const request: PermissionRequest = this.permissionForm.value;

    if (this.isEditMode && this.selectedPermissionId) {
      this.permissionService
        .updatePermission(this.selectedPermissionId, request)
        .subscribe({
          next: () => {
            this.toastService.success('Permission modifiée avec succès');
            this.loadPermissions();
            this.cancelPermissionForm();
          },
          error: (err) => {
            console.error('Erreur modification permission', err);
            this.toastService.error('Erreur lors de la modification');
          },
        });
    }
    else {
      this.permissionService.createPermission(request).subscribe({
        next: () => {
          this.toastService.success('Permission créée avec succès');
          this.loadPermissions();
          this.cancelPermissionForm();
        },
        error: (err) => {
          console.error('Erreur création permission', err);
          this.toastService.error('Erreur lors de la création');
        },
      });
    }
  }

  permRequest: Signal<PermissionRequest> = signal({
    nomPermission: '',
    descriptionPermission: '',
  });

  showFormMode = false;
  showPermissionForm = false;
  isEditRoleMode = false;
  selectedRoleId?: number;

   showForm() {
    this.initNewRole();
  }

 cancelForm() {
    this.showFormMode = false;
    this.isEditRoleMode = false;
    this.selectedRoleId = undefined;
  }
  roles: RoleResponse[] = [];
  page: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  permPage: number = 1;
  permPageSize: number = 10;
  permPageSizeOptions: number[] = [5, 10, 20, 50];

  showPermissionFormMode() {
    this.showPermissionForm = true;
  }

  cancelPermissionForm() {
    this.showPermissionForm = false;
  }
  roleRequest: RoleRequest = {
    nomRole: '',
    descriptionRole: '',
    permissionIds: new Set<number>(),
  };
  allPermissions: PermissionResponse[] = [];
  roleForm!: FormGroup;
  permForm!: FormGroup;
  loading = true;
  fb = inject(FormBuilder);
  permissionService = inject(PermissionsService);
  private roleService = inject(RolesService);


  ngOnInit(): void {
    this.initForm();
    this.loadPermissions();
    this.loadRoles();
  }
  initForm(): void {
    this.roleForm = this.fb.group({
      nomRole: ['', Validators.required],
      descriptionRole: [''],
      permissionIds: ['', Validators.required],
    });
    this.permissionForm = this.fb.group({
      nomPermission: ['', Validators.required],
      descriptionPermission: [''],
      module: ['', Validators.required],
      canRead: [false],
      canWrite: [false],
      canEdit: [false],
      canDelete: [false],
    });
  }
  initNewRole(): void {
    this.roleRequest = {
      nomRole: '',
      descriptionRole: '',
      permissionIds: new Set<number>(),
    };
    this.roleForm.reset({
      nomRole: '',
      descriptionRole: '',
      permissionIds: [],
    });
    this.isEditRoleMode = false;
    this.selectedRoleId = undefined;
    this.showFormMode = true;
  }
  editRole(role: RoleResponse): void {
    this.isEditRoleMode = true;
    this.selectedRoleId = role.id;
   const permissionIds = Array.from(role.permissions ?? [])
    .map((p) => p.id)
    .filter((id): id is number => id != null);
    this.roleForm.patchValue({
      nomRole: role.nomRole,
      descriptionRole: role.descriptionRole,
      permissionIds,
    });
    this.showFormMode = true;
  }
  onPermissionChange(event: any, permissionId: number): void {
    const permissionsControl = this.roleForm.get('permissionIds');
    if (!permissionsControl) {
      return;
    }

    // Bonne pratique : travailler avec une copie pour l'immutabilité
    const permissions: number[] = [...(permissionsControl.value || [])];

    if (event.target.checked) {
      if (permissionId != undefined) {
        permissions.push(permissionId);
      }
    } else {
      const index = permissions.indexOf(permissionId);
      if (index > -1) {
        permissions.splice(index, 1);
      }
    }
    permissionsControl.setValue(permissions);
  }
  submitForm(): void {
    if (this.roleForm.invalid) return;

    const formValue = this.roleForm.value;

    const roleRequest: RoleRequest = {
      nomRole: formValue.nomRole,
      descriptionRole: formValue.descriptionRole,
      permissionIds: formValue.permissionIds || []
    };

    if (this.isEditRoleMode && this.selectedRoleId) {
      this.roleService
        .updateRole(this.selectedRoleId, roleRequest)
        .subscribe({
          next: () => {
            this.toastService.success('Rôle modifié avec succès');
            this.loadRoles();
            this.cancelForm();
          },
          error: (err) => {
            console.error('Erreur modification rôle', err);
            this.toastService.error('Erreur lors de la modification');
          },
        });
    }
    else {
      this.roleService.createRole(roleRequest).subscribe({
        next: () => {
          this.toastService.success('Rôle créé avec succès');
          this.loadRoles();
          this.cancelForm();
        },
        error: (err) => {
          console.error('Erreur création rôle', err);
          this.toastService.error('Erreur lors de la création');
        },
      });
    }
  }


  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.allPermissions = permissions;
        this.changePermPage(this.permPage);
        console.log('**** PERMISSIONS ****', permissions);
      },
      error: (err) => {
        console.log(' ERREUR DES PERMISSIONS', err);
      },
    });
  }
  confirmDelete(roleId: number): void {
    if (!roleId) return;

    if (confirm('Voulez-vous vraiment supprimer ce rôle ?')) {
      this.roleService.deleteRole(roleId).subscribe({
        next: () => {
          this.toastService.success('Rôle supprimé');
          this.loadRoles();
        },
        error: (err) => {
          console.error('Erreur suppression rôle', err);
          this.toastService.error('Suppression impossible');
        }
      });
    }
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.listDesRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.changePage(this.page);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.log('error de chargement', error);
      },
    });
  }
  onPageSizeChange() {
    this.page = 1;
  }

  changePage(newPage: number) {
    if (newPage < 1) {
      this.page = 1;
    } else if (newPage > this.totalPages) {
      this.page = this.totalPages;
    } else {
      this.page = newPage;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.roles.length / this.pageSize) || 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  get pagedRoles(): RoleResponse[] {
    const start = (this.page - 1) * this.pageSize;
    return this.roles.slice(start, start + this.pageSize);
  }

  onPermPageSizeChange() {
    this.permPage = 1;
  }

  changePermPage(newPage: number) {
    if (newPage < 1) {
      this.permPage = 1;
    } else if (newPage > this.permTotalPages) {
      this.permPage = this.permTotalPages;
    } else {
      this.permPage = newPage;
    }
  }

  get permTotalPages(): number {
    return Math.ceil(this.allPermissions.length / this.permPageSize) || 1;
  }

  get permPages(): number[] {
    return Array.from({ length: this.permTotalPages }, (_, i) => i + 1);
  }

  get pagedPermissions(): PermissionResponse[] {
    const start = (this.permPage - 1) * this.permPageSize;
    return this.allPermissions.slice(start, start + this.permPageSize);
  }

  // Pour l'action Modifier une permission
  editPermission(permission: PermissionResponse) {
    this.isEditMode = true;
    this.showPermissionForm = true;
    // Remplir le formulaire avec les données de la permission sélectionnée
    this.permissionForm.patchValue({
      nomPermission: permission.nomPermission,
      descriptionPermission: permission.descriptionPermission,
      module: permission.module,
      canRead: permission.canRead,
      canWrite: permission.canWrite,
      canEdit: permission.canEdit,
      canDelete: permission.canDelete
    });
    this.selectedPermissionId = permission.id;
  }

  // Pour l'action Supprimer une permission
  confirmDeletePermission(permissionId: number) {
    if (!permissionId) return;

    if (confirm('Voulez-vous vraiment supprimer cette permission ?')) {
      this.permissionService.deletePermission(permissionId).subscribe({
        next: () => {
          this.toastService.success('Permission supprimée');
          this.loadPermissions();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Erreur suppression permission');
        }
      });
    }
  }

  // Exemple de méthode de suppression (à adapter selon votre service)
  deletePermission(permissionId: number) {
    this.loading = true;
    this.permissionService.deletePermission(permissionId).subscribe({
      next: () => {
        this.allPermissions = this.allPermissions.filter(p => p.id !== permissionId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors de la suppression');
      }
    });
  }

  selectedPermissionId?: number;
}
