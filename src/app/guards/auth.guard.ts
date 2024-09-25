import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/rol';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiresAdministradorOrEncargado = state.url === '/dashboard'

    if (requiresAdministradorOrEncargado) {
      const userHasRoles = this.authService.userHasAnyOfTheseRoles([Rol.ADMINISTRADOR, Rol.ENCARGADO]);
      if (!userHasRoles) {
        this.router.navigate(['/pedidos']);
        return false;
      }
    }

    return true;

  }

}
