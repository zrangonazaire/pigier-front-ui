import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AuthenticationRequest,
  AuthenticationService,
} from '../../../api-client';
import { Router, RouterLink } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { jwtDecode } from 'jwt-decode';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface DecodedToken {
  sub: string; // Subject (username)
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
  authorities: string; // String de rôles/permissions séparés par des virgules
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  toastService = inject(ToastrService);
  currentUser = '';
  roleCommer = false;
  roleAdmin = false;
  roleComptable = false;
  roleNote = false;
  roleDirCom = false;

  currentUserRole: string = 'Poste Utilisateur';
  currentRole: any[] = [];
  private subscription: Subscription[] = [];
  private tokenService = inject(TokenService);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  tokken = signal<string | null>(null);
  authResponse = signal<string | null>(null);
  authLogin: AuthenticationRequest = {
    username: '',
    password: '',
  };

  isLoading = signal(false);
  errorMessage = signal('');

  onLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.subscription.push(
      this.authService.login(this.authLogin).subscribe({
        next: (response: any) => {
          this.tokenService.saveToken(response.token!);
          localStorage.setItem('access_token', response.token!);
          this.currentUser = localStorage.getItem('access_token') || '';
          if (this.currentUser) {
            this.roleAdmin = false;
            this.roleCommer = false;
            this.roleComptable = false;
            this.roleNote = false;
            this.roleDirCom = false;

            try {
              const decodedToken = jwtDecode<any>(this.currentUser);
              this.currentRole = decodedToken.fullUser.roles;
              this.currentUser =
                decodedToken.fullUser.lastname || 'Utilisateur';

              for (let index = 0; index < this.currentRole.length; index++) {
                const element = this.currentRole[index].nomRole;
                if (element === 'ROLE_ADMIN') {
                  this.router.navigate(['/tb-preinscr']);
                } else if (element === 'ROLE_COMMERCIALE') {
                  this.router.navigate(['/tb-preinscr']);
                } else if (element === 'ROLE_COMPTABLE') {
                  this.router.navigate(['/tb-compta']);
                } else if (element === 'ROLE_NOTE') {
                  this.router.navigate(['/tb-peda']);
                } else if (element === 'ROLE_DIR_COM') {
                  this.router.navigate(['/tb-preinscr']);
                }
              }
              this.toastService.success(
                'Connexion réussie ! Bienvenue ' + this.currentUser,
                'Succès'
              );
            } catch (error) {
              this.currentUser = 'Utilisateur';
            }
          } else {
            this.currentUser = 'Utilisateur';
          }
          console.log('User logged role', this.currentRole);
        },
        error: (error) => {
          this.errorMessage.set('Email ou mot de passe incorrect');
          this.isLoading.set(false);
          console.error('Login error', error);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      })
    );
  }
}
