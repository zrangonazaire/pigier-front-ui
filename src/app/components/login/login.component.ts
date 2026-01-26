
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationRequest } from '../../../api-client';
import { Router, RouterLink } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserAuthservice } from '../../services/user.auth.service';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface DecodedToken {
  sub: string; // Subject (username)
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
  authorities: string; // String de roles/permissions separes par des virgules
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  toastService = inject(ToastrService);
  currentUser = '';
  private subscription: Subscription[] = [];
  private tokenService = inject(TokenService);
  private authService = inject(UserAuthservice);
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
          localStorage.setItem('access_token', response.token!);
          const decodedToken: any = this.tokenService.decodeToken();
          const tokenUser = decodedToken?.fullUser ?? decodedToken;
          this.currentUser = tokenUser?.lastname || 'Utilisateur';
          const redirectTo = this.resolveDefaultRoute();
          this.router.navigate([redirectTo]);
          this.toastService.success(
            'Connexion reussie ! Bienvenue ' + this.currentUser,
            'Succes'
          );
        },
        error: (error) => {
          this.errorMessage.set('Email ou mot de passe incorrect');
          this.isLoading.set(false);
          console.error('Login error', error.message);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      })
    );
  }

  private modulePermissions(module: string): string[] {
    const key = module.replace(/\s+/g, '_').toUpperCase();
    return [
      `READ_${key}`,
      `WRITE_${key}`,
      `EDIT_${key}`,
      `DELETE_${key}`,
    ];
  }

  private hasModuleAccess(module: string): boolean {
    return this.authService.hasAnyPermission(this.modulePermissions(module));
  }

  private resolveDefaultRoute(): string {
    const moduleRoutes = [
      { module: 'PREINSCRIPTION', route: '/tb-preinscr' },
      { module: 'COMMERCIALE', route: '/tb-preinscr' },
      { module: 'COMPTABILITE', route: '/compta/tb-compta' },
      { module: 'NOTE', route: '/notes/note' },
      { module: 'EXAMEN', route: '/tb-peda' },
      { module: 'ELEVE', route: '/eleve/etat-etudiant-dianenew' },
    ];

    const match = moduleRoutes.find(({ module }) => this.hasModuleAccess(module));
    return match ? match.route : '/login';
  }
}
