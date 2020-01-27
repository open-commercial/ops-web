import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Factura } from '../models/factura';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NuevosResultadosComprobante } from '../models/nuevos-resultados-comprobante';
import { Resultados } from '../models/resultados';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  url = environment.apiUrl + '/api/v1/facturas';

  constructor(private http: HttpClient) { }

  getFactura(id: number): Observable<Factura> {
    return this.http.get<Factura>(this.url + `/${id}`);
  }

  calcularResultadosFactura(nrf: NuevosResultadosComprobante): Observable<Resultados> {
    return this.http.post<Resultados>(this.url + `/calculo-factura`, nrf);
  }
}
