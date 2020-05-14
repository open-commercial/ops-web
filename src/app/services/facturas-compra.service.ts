import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaFacturaCompraCriteria } from '../models/criterias/busqueda-factura-compra-criteria';

@Injectable({
  providedIn: 'root'
})
export class FacturasCompraService {
  url = environment.apiUrl + '/api/v1/facturas/compras';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaFacturaCompraCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }
}
