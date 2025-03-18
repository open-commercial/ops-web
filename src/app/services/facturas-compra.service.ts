import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { BusquedaFacturaCompraCriteria } from '../models/criterias/busqueda-factura-compra-criteria';
import { TipoDeComprobante } from '../models/tipo-de-comprobante';
import { SucursalesService } from './sucursales.service';
import { NuevoRenglonFactura } from '../models/nuevo-renglon-factura';
import { RenglonFactura } from '../models/renglon-factura';
import { HelperService } from './helper.service';
import { NuevaFacturaCompra } from '../models/nueva-factura-compra';
import { FacturaCompra } from '../models/factura-compra';

@Injectable({providedIn: 'root'})
export class FacturasCompraService {
  url = environment.apiUrl + '/api/v1/facturas/compras';
  urlBusqueda = this.url + '/busqueda/criteria';

  constructor(private http: HttpClient,
              private sucursalesService: SucursalesService) { }

  buscar(criteria: BusquedaFacturaCompraCriteria): Observable<Pagination> {
    return this.http.post<Pagination>(this.urlBusqueda, criteria);
  }

  totalFacturado(criteria: BusquedaFacturaCompraCriteria): Observable<number> {
    return this.http.post<number>(`${this.url}/total-facturado/criteria`, criteria);
  }

  totalIva(criteria: BusquedaFacturaCompraCriteria): Observable<number> {
    return this.http.post<number>(`${this.url}/total-iva/criteria`, criteria);
  }

  getTiposDeComprobante(idProveedor: number): Observable<TipoDeComprobante[]>{
    const idSucursal = this.sucursalesService.getIdSucursal();
    return this.http.get<TipoDeComprobante[]>(`${this.url}/tipos/sucursales/${idSucursal}/proveedores/${idProveedor}`);
  }

  calcularRenglones(renglones: NuevoRenglonFactura[], tipoDeComprobante: TipoDeComprobante): Observable<RenglonFactura[]> {
    const qs = HelperService.getQueryString({tipoDeComprobante});
    return this.http.post<RenglonFactura[]>(`${this.url}/renglones?${qs}`, renglones);
  }

  guardarFacturaCompa(nfc: NuevaFacturaCompra): Observable<FacturaCompra> {
    return this.http.post<FacturaCompra>(this.url, nfc);
  }
}
