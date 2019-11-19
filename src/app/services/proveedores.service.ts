import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaProveedorCriteria } from '../models/criterias/busqueda-proveedor-criteria';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  url = environment.apiUrl + '/api/v1/proveedores';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  getProveedores(input, page = 0): Observable<Pagination> {
    const criteria: BusquedaProveedorCriteria = { nroProveedor: input, razonSocial: input, pagina: page };
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }
}
