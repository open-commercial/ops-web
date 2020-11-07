import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    if (!isAuthenticated) {
      this.router.navigate(['/login'], {queryParams: {return: state.url}});
    }
    return isAuthenticated;
  }
}
