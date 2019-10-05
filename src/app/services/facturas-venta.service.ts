import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { HttpClient } from '@angular/common/http';
import { BusquedaFacturaVentaCriteria } from '../models/criterias/busqueda-factura-venta-criteria';

@Injectable({
  providedIn: 'root'
})
export class FacturasVentaService {
  url = environment.apiUrl + '/api/v1/facturas/venta';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaFacturaVentaCriteria, page: number = 0): Observable<Pagination> {
    criteria.pagina = page;
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }
}
