import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenKey = 'auth_token';

  // Check if token has valid format
  private isTokenFormatValid(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3;
  }

  // Save token with validation
  saveToken(token: string): void {
    if (!this.isTokenFormatValid(token)) {
      throw new Error('Invalid token format');
    }
    localStorage.setItem(this.tokenKey, token);
  }

  // Get token with validation
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token && this.isTokenFormatValid(token) ? token : null;
  }

  // Safe decode with error handling
  decodeToken<T>(): T | null {
    try {
      const token = this.getToken();
      if (!token) return null;
      return jwtDecode<T>(token);
    } catch (error) {
      console.error('Token decoding failed:', error);
      this.removeToken(); // Clear invalid token
      return null;
    }
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // ... rest of the methods remain the same
}