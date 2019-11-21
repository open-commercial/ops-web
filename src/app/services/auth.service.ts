import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';
import { UsuariosService } from './usuarios.service';
import { StorageService } from './storage.service';

@Injectable()
export class AuthService {

  urlLogin = environment.apiUrl + '/api/v1/login';
  urlLogout = environment.apiUrl + '/api/v1/logout';
  urlPasswordRecovery = environment.apiUrl + '/api/v1/password-recovery?idEmpresa=' + environment.idEmpresa;
  jwtHelper = new JwtHelperService();
  private nombreUsuarioLoggedInSubject = new Subject<string>();
  nombreUsuarioLoggedIn$ = this.nombreUsuarioLoggedInSubject.asObservable();

  constructor(private http: HttpClient,
              private router: Router,
              private usuariosService: UsuariosService,
              private storageService: StorageService) {}

  setNombreUsuarioLoggedIn(nombre: string) {
    this.nombreUsuarioLoggedInSubject.next(nombre);
  }

  login(user: string, pass: string) {
    const credential = { username: user, password: pass};
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
    this.http.put(this.urlLogout, null)
      .subscribe(data => {
        this.storageService.clear();
        this.router.navigate(['']);
      });
  }

  getToken(): string {
    return this.storageService.getItem('token');
  }

  isAuthenticated(): boolean {
    return !this.jwtHelper.isTokenExpired(this.storageService.getItem('token'));
  }

  getLoggedInUsuario(): Observable<Usuario> {
    return this.usuariosService.getUsuario(this.storageService.getItem('id_Usuario'));
  }

  getLoggedInIdUsuario(): string {
    return this.storageService.getItem('id_Usuario');
  }

  solicitarCambioContrasenia(email: string) {
    return this.http.get(this.urlPasswordRecovery + `&email=${email}`);
  }

  cambiarPassword(k: string, i: number) {
    return this.http.post(this.urlPasswordRecovery, { key: k, id: i }, {responseType: 'text'});
  }

  setAuthenticationInfo(token: string) {
    this.storageService.setItem('token', token);
    const decodedToken = this.jwtHelper.decodeToken(token);
    this.storageService.setItem('id_Usuario', decodedToken.idUsuario);
  }
}
