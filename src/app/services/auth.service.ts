import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {throwError, Observable, Subject} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {Usuario} from '../models/usuario';
import {UsuariosService} from './usuarios.service';

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
              private usuariosService: UsuariosService) {}

  setNombreUsuarioLoggedIn(nombre: string) {
    this.nombreUsuarioLoggedInSubject.next(nombre);
  }

  login(username: string, password: string) {
    const credential = { username: username, password: password};
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
        localStorage.clear();
        this.router.navigate(['']);
      });
  }

  getToken(): string {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !this.jwtHelper.isTokenExpired(localStorage.getItem('token'));
  }

  getLoggedInUsuario(): Observable<Usuario> {
    return this.usuariosService.getUsuario(localStorage.getItem('id_Usuario'));
  }

  getLoggedInIdUsuario(): string {
    return localStorage.getItem('id_Usuario');
  }

  solicitarCambioContrasenia(email: string) {
    return this.http.get(this.urlPasswordRecovery + `&email=${email}`);
  }

  cambiarContrasenia(key: string, id: number) {
    return this.http.post(this.urlPasswordRecovery, {'key': key, 'id': id}, {responseType: 'text'});
  }

  setAuthenticationInfo(token: string) {
    localStorage.setItem('token', token);
    const decodedToken = this.jwtHelper.decodeToken(token);
    localStorage.setItem('id_Usuario', decodedToken.idUsuario);
  }
}
