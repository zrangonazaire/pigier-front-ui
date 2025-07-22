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

  permissionForm!: FormGroup;
  submitted = false;

  availableModules = [
    'PREINSCIPTION',
    'COMPTABILITE',
    'COMMERCIALE',
    'EXAMEN',
    'NOTE',
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

    this.submitFormPerm.emit(this.permissionForm.value);
  }

  onCancelPerm(): void {
    this.cancelFormPerm.emit();
  }
  submitPermissionForm() {
    this.permissionService.createPermission(this.permRequest()).subscribe({
      next: () => {
        alert('Permission créée avec succès');
        this.loadPermissions();
        this.cancelPermissionForm();
      },
      error: (err) => {
        console.log('ERREUR DE CREATION DE PERMISSION', err);
      },
    });
  }
  permRequest: Signal<PermissionRequest> = signal({
    nomPermission: '',
    descriptionPermission: '',
  });

  showFormMode = false;
  showPermissionForm = false;

  showForm() {
    this.showFormMode = true;
  }

  cancelForm() {
    this.showFormMode = false;
  }
  roles: RoleResponse[] = [];

  showPermissionFormMode() {
    this.showPermissionForm = true;
  }

  cancelPermissionForm() {
    this.showPermissionForm = false;
  }
  roleRequest: RoleRequest = {
    nomRole: '',
    descriptionRole: '',
    permissionIds: new Set(),
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
      permissionIds: [[]],
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
      permissionIds: new Set(),
    };
    this.roleForm.reset();
    this.showFormMode = true;
  }
  editRole(): void {
    if (this.roleRequest.permissionIds) {
      const permissionObjects = Array.from(
        this.roleRequest.permissionIds as any as Iterable<PermissionResponse>
      );
      this.roleRequest = {
        ...this.roleRequest,
        permissionIds: new Set(
          permissionObjects
            .map((p) => p.id)
            .filter((id) => id != null) as number[]
        ),
      };
    }
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
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      const roleRequest: RoleRequest = {
        nomRole: formValue.nomRole,
        descriptionRole: formValue.descriptionRole,
        permissionIds: new Set(formValue.permissionIds),
      };
      this.roleService.createRole(this.roleForm.value).subscribe({
        next: () => {
          alert('Rôle créé avec succès');
          this.showFormMode = false;
          this.loadRoles();
        },
        error: (err) =>
          console.error(
            "Une erreur s'est produite lors de la création du rôle",
            err.message
          ),
      });
    }
  }

  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.allPermissions = permissions;
        console.log('PERMISSIONS', permissions);
      },
      error: (err) => {
        console.log(' ERREUR DES PERMISSIONS', err);
      },
    });
  }
  confirmDelete(role: any): void {
    if (confirm('Voulez-vous vraiment supprimer ce rôle ?')) {
      this.roleService.deleteRole(role).subscribe({
        next: () => {
          this.loadRoles();
        },
      });
    }
  }
  loadRoles(): void {
    this.loading = true;
    this.roleService.listDesRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.log('error de chargement', error);
      },
    });
  }
}
