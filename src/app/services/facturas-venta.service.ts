import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { HttpClient } from '@angular/common/http';
import { BusquedaFacturaVentaCriteria } from '../models/criterias/busqueda-factura-venta-criteria';
import { TipoDeComprobante } from '../models/tipo-de-comprobante';
import { NuevoRenglonFactura } from '../models/nuevo-renglon-factura';
import { FacturaVenta } from '../models/factura-venta';
import { RenglonFactura } from '../models/renglon-factura';

@Injectable({
  providedIn: 'root'
})
export class FacturasVentaService {
  url = environment.apiUrl + '/api/v1/facturas/ventas';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient) { }

  buscar(criteria: BusquedaFacturaVentaCriteria, page: number = 0): Observable<Pagination> {
    criteria.pagina = page;
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  getTiposDeComprobante(idSucursal: number, idCliente: number): Observable<TipoDeComprobante[]> {
    return this.http.get<TipoDeComprobante[]>(this.url + `/tipos/sucursales/${idSucursal}/clientes/${idCliente}`);
  }

  calcularRenglones(renglones: NuevoRenglonFactura[], tipoDeComprobante: TipoDeComprobante): Observable<RenglonFactura[]> {
    return this.http.post<RenglonFactura[]>(this.url + `/renglones?tipoDeComprobante=${tipoDeComprobante}`, renglones);
  }

  getFacturaPdf(factura: FacturaVenta): Observable<Blob> {
    return this.http.get(`${this.url}/${factura.idFactura}/reporte`, {responseType: 'blob'});
  }
}
