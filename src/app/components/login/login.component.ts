import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthenticationRequest, AuthenticationResponse, AuthenticationService } from '../../../api-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  private authService = inject(AuthenticationService);
  private router=inject(Router);
  tokken=signal<string | null>(null);
  authResponse = signal<AuthenticationResponse | null>(null);
  authLogin:AuthenticationRequest={
    username: '',  
    password: ''
  };

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }
    isLoading = signal(false);
  errorMessage = signal('');

  onLogin() {

    if (this.loginForm.valid) {
      this.authLogin.username = this.loginForm.value.email;
      this.authLogin.password = this.loginForm.value.password;
      this.authService.login(this.authLogin).subscribe({
        next: (response) => {
          localStorage.setItem('access_token', response.token!);
          this.router.navigate(['/tb-preinscr']);
          this.tokken.set(response.token!);
          this.authResponse.set(response);
          console.log('Login successful :::: '+this.authResponse);
          // You can redirect or perform other actions here
        },
        error: (error) => {
       this.errorMessage.set('Email ou mot de passe incorrect');
        this.isLoading.set(false);
          console.error('Login error', error);
        },
              complete: () => {
        this.isLoading.set(false);
      }
      });
      console.log(this.loginForm.value);
    }
  }
}
