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
import { SucursalesService } from './sucursales.service';
import { NuevaFacturaVenta } from '../models/nueva-factura-venta';
import { HelperService } from './helper.service';

@Injectable({providedIn: 'root'})
export class FacturasVentaService {
  url = environment.apiUrl + '/api/v1/facturas/ventas';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient,
              private sucursalesService: SucursalesService) { }

  buscar(criteria: BusquedaFacturaVentaCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  totalFacturado(criteria: BusquedaFacturaVentaCriteria): Observable<number> {
    return this.http.post<number>(`${this.url}/total-facturado/criteria`, criteria);
  }

  totalIva(criteria: BusquedaFacturaVentaCriteria): Observable<number> {
    return this.http.post<number>(`${this.url}/total-iva/criteria`, criteria);
  }

  gananciaTotal(criteria: BusquedaFacturaVentaCriteria): Observable<number> {
    return this.http.post<number>(`${this.url}/ganancia-total/criteria`, criteria);
  }

  getFacturasPorId(ids: number[]): Observable<FacturaVenta[]> {
    const qs = HelperService.getQueryString({ idFactura: ids.join(',') });
    return this.http.get<FacturaVenta[]>(`${this.url}?${qs}`);
  }

  getTiposDeComprobante(idCliente: number): Observable<TipoDeComprobante[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    return this.http.get<TipoDeComprobante[]>(this.url + `/tipos/sucursales/${idSucursal}/clientes/${idCliente}`);
  }

  calcularRenglones(renglones: NuevoRenglonFactura[], tipoDeComprobante: TipoDeComprobante): Observable<RenglonFactura[]> {
    const qs = HelperService.getQueryString({tipoDeComprobante});
    return this.http.post<RenglonFactura[]>(this.url + `/renglones?${qs}`, renglones);
  }

  getFacturaPdf(idFactura: number): Observable<Blob> {
    return this.http.get(`${this.url}/${idFactura}/reporte`, {responseType: 'blob'});
  }

  guardarFacturaVenta(nfv: NuevaFacturaVenta, idPedido: number): Observable<FacturaVenta[]> {
    return this.http.post<FacturaVenta[]>(`${this.url}/pedidos/${idPedido}`, nfv);
  }

  getReglonesDePedido(idPedido: number, tipoDeComprobante: TipoDeComprobante): Observable<RenglonFactura[]> {
    const qs = HelperService.getQueryString({tipoDeComprobante});
    return this.http.get<RenglonFactura[]>(`${this.url}/renglones/pedidos/${idPedido}?${qs}`);
  }

  enviarPorEmail(idFactura: number): Observable<void> {
    return this.http.get<void>(`${this.url}/email/${idFactura}`);
  }
}
