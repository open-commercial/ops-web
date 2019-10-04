import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SucursalesService } from './sucursales.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  url = environment.apiUrl + '/api/v1/proveedores';
  urlBusqueda = this.url + '/busqueda/criteria?idEmpresa=' + SucursalesService.getIdSucursal();

  constructor(private http: HttpClient) { }

  getProveedores(input, page = 0): Observable<Pagination> {
    const terminos = { nroProveedor: input, razonSocial: input, pagina: page };
    return this.http.get<Pagination>(this.urlBusqueda + '&' + HelperService.getQueryString(terminos));
  }
}
