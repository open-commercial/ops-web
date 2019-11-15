import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { FacturaVenta } from '../models/factura';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  urlFacturas = environment.apiUrl + '/api/v1/facturas';

  constructor(private http: HttpClient) { }

  getFacturaPdf(factura: FacturaVenta): Observable<Blob> {
    return this.http.get(`${this.urlFacturas}/${factura.idFactura}/reporte`, {responseType: 'blob'});
  }
}
