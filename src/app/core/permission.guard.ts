import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { UserAuthservice } from "../services/user.auth.service";

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
    router = inject(Router);
    userServiceAuth = inject(UserAuthservice);
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    // Ce guard suppose qu'un AuthGuard a peut-être déjà été exécuté.
    // Cependant, pour plus de robustesse, nous vérifions également ici le statut d'authentification.
    if (!this.userServiceAuth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredPermissions = route.data['permissions'] as string[];

    // La méthode hasAnyPermission gère déjà le cas où aucune permission n'est requise.
    const hasPermission = this.userServiceAuth.hasAnyPermission(requiredPermissions);

    if (hasPermission) {
      return true;
    }
   this.router.navigate(['/unauthorized']);
    return false;
  }
}
