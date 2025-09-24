import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  RoleResponse,
  RolesService,
  UserRequest,
  UserResponse,
  UtilisateurControllerService,
} from '../../../../api-client';
import { Role } from '../../../features/permission-management/permission.service';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-list',
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  providers: [DatePipe],
})
export class UserListComponent implements OnInit {
  toastService = inject(ToastrService);
  showFormMode = false;
  users: UserRequest[] = [];
  allRoles = signal<RoleResponse[]>([]);
  loading = false;
  userRequest: UserRequest = {};
  userResponse: UserResponse = {};
  listeUsers = signal<UserResponse[]>([]);
  userForm: FormGroup;
  userId: number = 0;
  private utilisateurService = inject(UtilisateurControllerService);
  private roleService = inject(RolesService);
  userRoles = signal<RoleResponse[]>([]);
  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      nomPrenoms: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', Validators.required],
      roleIds: [[], Validators.required],
    });

    // Chargez les rôles depuis votre service
    // this.loadRoles();
  }
  listUserRoles(): void {
    this.roleService.getRolesByUser(this.userId).subscribe({
      next: (roles) => {
        this.userRoles.set(roles);
        console.log('LES ROLES DE L\'UTILISATEUR', this.userRoles);
      },
      error: (error) => {
        console.log('Erreur de chargement des roles de l\'utilisateur', error);
      },
    });     
  }
  listRoles(): void {
    this.roleService.listDesRoles().subscribe({
      next: (roles) => {
        this.allRoles.set(roles);
        console.log('LES ROLES', this.allRoles);
      },
      error: (error) => {
        console.log('Erreur de chargement des roles', error);
      },
    });
  }
  ngOnInit(): void {
    this.listUtilisateurs();
    this.listRoles();
  }
  toggleUserStatus(userId: number) {
    // Implémentez la logique de changement de statut
    // this.userService.toggleStatus(userId).subscribe(...);
  }
  formatUserDates(users: UserResponse[]): UserResponse[] {
    return users.map((user) => ({
      ...user,
      formattedCreatedDate: user.createdDate
        ? new Date(user.createdDate).toLocaleDateString('fr-FR')
        : undefined,
    }));
  }
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('passwordConfirm')?.value
      ? null
      : { mismatch: true };
  }

  initNewUser() {
    this.userRequest = {};
    this.userForm.reset();
    this.showFormMode = true;
  }

  editUser(user: UserRequest) {
    console.log('Edit user called with:', user);
    this.userRequest = { ...user };
    this.utilisateurService.getByUsername(user.username!).subscribe({
      next: (fullUser) => {
        this.userId = fullUser.id!;
        this.userResponse = fullUser;
        // Patch le formulaire avec les vraies données reçues
        this.userForm.patchValue({
          nomPrenoms: fullUser.lastname,
          username: fullUser.username,
          email: fullUser.email,
          telephone: fullUser.telephone,
          roleIds: fullUser.roles ? fullUser.roles.map(r => r.id) : [],
          // Ajoute d'autres champs si besoin
        });
        //console.log('Formulaire patché avec :', this.userForm.value);
        this.listUserRoles();
        this.showFormMode = true;
      },
      error: (error) => {
        console.log('Erreur lors de la récupération des détails de l\'utilisateur', error);
      }
    });
  }

  isRoleSelected(roleId: number): boolean {
    return this.userForm.get('roleIds')?.value.includes(roleId);
  }

  onRoleChange(event: any, roleId: number) {
    const rolesControl = this.userForm.get('roleIds');
    if (!rolesControl) {
      return;
    }
    const currentRoles: number[] = rolesControl.value
      ? [...rolesControl.value]
      : [];

    if (event.target.checked) {
      currentRoles.push(roleId);
    } else {
      const index = currentRoles.indexOf(roleId);
      if (index > -1) currentRoles.splice(index, 1);
    }
    rolesControl.setValue(currentRoles);
    console.log('Les nouveaux rôles', currentRoles);
  }
  listUtilisateurs() {
    this.loading = true;
    this.utilisateurService.getAll().subscribe({
      next: (users) => {
        this.loading = false;
        this.listeUsers.set(this.formatUserDates(users));
        users;
        console.log('Liste des utilistateurs', this.listeUsers);
      },
      error: (error) => {
        this.loading = false;
        console.log('error de chargement', error);
      },
    });

  }
  submitForm() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      // On prépare l'objet UserRequest
      const userRequest: UserRequest = {
        ...this.userRequest,
        nomPrenoms: formValue.nomPrenoms,
        username: formValue.username,
        email: formValue.email,
        telephone: formValue.telephone,
        roleIds: new Set(formValue.roleIds),
      };

      // On ajoute le mot de passe uniquement s'il a été saisi.
      // Cela évite de l'écraser avec une chaîne vide lors d'une modification.
      if (formValue.password) {
        userRequest.password = formValue.password;
      }

      const isUpdate = !!userRequest.id;
      console.log('Données du formulaire envoyées :', userRequest);

      this.utilisateurService.create(this.userForm.value).subscribe({
        next: () => {
          alert(`Utilisateur ${isUpdate ? 'mis à jour' : 'ajouté'} avec succès`);
          this.listUtilisateurs();
          this.cancelForm();
        },
        error: (error) => {
          alert(`Erreur lors de ${isUpdate ? 'la mise à jour' : "l'ajout"} de l'utilisateur: ` + (error.error?.message || error.message));
        },
      });
    }
  }

  cancelForm() {
    this.showFormMode = false;
  }

  page: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

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
    return Math.ceil(this.listeUsers().length / this.pageSize) || 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  get pagedUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.listeUsers().slice(start, start + this.pageSize);
  }

  trackById(index: number, user: UserResponse) {
    return user.id;
  }
}
