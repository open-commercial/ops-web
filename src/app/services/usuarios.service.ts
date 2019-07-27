import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Usuario} from '../models/usuario';

@Injectable()
export class UsuariosService {

  url = environment.apiUrl + '/api/v1/usuarios';

  constructor(private http: HttpClient) {}

  getUsuario(id: number|string): Observable<Usuario> {
    return this.http.get<Usuario>(this.url + '/' + id);
  }

  saveUsuario(usuario: Usuario) {
    return this.http.put(this.url, usuario);
  }
}
