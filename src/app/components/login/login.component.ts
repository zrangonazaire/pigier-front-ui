import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  AuthenticationService,
} from '../../../api-client';
import { Router, RouterLink } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { jwtDecode } from 'jwt-decode';
import { Subscription } from 'rxjs';

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
          console.log('User logged in successfully', response.token!);
          this.router.navigate(['/tb-preinscr']);
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
