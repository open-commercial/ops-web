import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SucursalesService } from './sucursales.service';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaFacturaCompraCriteria } from '../models/criterias/busqueda-factura-compra-criteria';

@Injectable({
  providedIn: 'root'
})
export class FacturasCompraService {
  url = environment.apiUrl + '/api/v1/facturas/compra';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaFacturaCompraCriteria, page: number = 0): Observable<Pagination> {
    criteria.pagina = page;
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }
}
