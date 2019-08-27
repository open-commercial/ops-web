import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { Pagination } from '../models/pagination';
import { EmpresaService } from './empresa.service';
import { Rol } from '../models/rol';
import { HelperService } from './helper.service';

@Injectable()
export class UsuariosService {

  url = environment.apiUrl + '/api/v1/usuarios';
  urlBusqueda = this.url + '/busqueda/criteria?idEmpresa=' + EmpresaService.getIdEmpresa();

  constructor(private http: HttpClient) {}

  getUsuarios(input, page = 0, roles: Array<Rol> = []): Observable<Pagination> {
    const terminos = {
      username: input, nombre: input, apellido: input, email: input,
      roles: roles.map((r: Rol) => Rol[r]).join(', '),
      pagina: page
    };

    return this.http.get<Pagination>(this.urlBusqueda + '&' + HelperService.getQueryString(terminos));
  }

  getUsuario(id: number|string): Observable<Usuario> {
    return this.http.get<Usuario>(this.url + '/' + id);
  }

  saveUsuario(usuario: Usuario) {
    return this.http.put(this.url, usuario);
  }
}
