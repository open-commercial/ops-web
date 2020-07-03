import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';
import { UsuariosService } from './usuarios.service';
import { StorageKeys, StorageService } from './storage.service';
import { LoadingOverlayService } from './loading-overlay.service';
import { Rol } from '../models/rol';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  urlLogin = environment.apiUrl + '/api/v1/login';
  urlLogout = environment.apiUrl + '/api/v1/logout';
  urlPasswordRecovery = environment.apiUrl + '/api/v1/password-recovery';
  jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient,
              private router: Router,
              private usuariosService: UsuariosService,
              private storageService: StorageService,
              private loadingOverlayService: LoadingOverlayService) {}

  login(user: string, pass: string) {
    const credential = { username: user, password: pass, aplicacion: environment.appName };
    return this.http.post(this.urlLogin, credential, {responseType: 'text'})
      .pipe(
        map(data => {
          this.setAuthenticationInfo(data);
        }),
        catchError(err => {
          let msjError;
          if (err.status === 0) {
            msjError = 'Servicio no disponible :(';
          } else {
            msjError = err.error;
          }
          return throwError(msjError);
        })
      );
  }

  logout() {
    this.loadingOverlayService.activate();
    this.http.put(this.urlLogout, null)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(() => {
        const keysToRemove = [StorageKeys.TOKEN];
        keysToRemove.forEach(v => this.storageService.removeItem(v));
        this.router.navigate(['']);
      })
    ;
  }

  getToken(): string {
    return this.storageService.getItem('token');
  }

  isAuthenticated(): boolean {
    return !this.jwtHelper.isTokenExpired(this.storageService.getItem('token'));
  }

  getLoggedInUsuario(): Observable<Usuario> {
    return this.usuariosService.getUsuario(this.getLoggedInIdUsuario());
  }

  getLoggedInIdUsuario(): string {
    const token = this.storageService.getItem('token');
    if (!token) { return null; }

    const decodedToken = this.jwtHelper.decodeToken(token);
    return decodedToken.idUsuario;
  }

  solicitarCambioContrasenia(email: string) {
    return this.http.get(this.urlPasswordRecovery + `&email=${email}`);
  }

  cambiarPassword(k: string, i: number) {
    return this.http.post(this.urlPasswordRecovery, { key: k, id: i, aplicacion: environment.appName }, {responseType: 'text'});
  }

  setAuthenticationInfo(token: string) {
    this.storageService.setItem(StorageKeys.TOKEN, token);
  }

  userHasAnyOfTheseRoles(u: Usuario, roles: Rol[]): boolean {
    return u && u.roles.filter(x => roles.includes(x)).length > 0;
  }
}
