import { inject, Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { TokenService } from "../services/token.service";

@Injectable({
  providedIn: "root"})

export class AuthGuard implements CanActivate {
  router= inject(Router);
  tokenUser = inject(TokenService);
  canActivate(): boolean {
    const token = this.tokenUser.getToken();
    if (token) {
        // Token exists, user is authenticated
        return true;
    }else{
      this.router.navigate(['/login']);
      return false;
    }
  }
      // Token exists, user is authenticated}
}
