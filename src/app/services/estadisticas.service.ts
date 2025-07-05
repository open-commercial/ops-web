import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SucursalesService } from './sucursales.service';
import { PeriodoMonto } from '../models/periodo-monto';
import { EntidadMonto } from '../models/entidad-monto';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {

  urlPurchaseStatistics = environment.apiUrl + '/api/v1/estadisticas/compras';
  urlSalesStatistics = environment.apiUrl + '/api/v1/estadisticas/ventas'
  http: HttpClient = inject(HttpClient);
  sucursalesService: SucursalesService = inject(SucursalesService);

  getMontoNetoCompradoAnual(): Observable<PeriodoMonto[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchaseStatistics}/monto-neto-anual/sucursales/${idSucursal}`;
    return this.http.get<PeriodoMonto[]>(url);
  }

  getMontoNetoCompradoAnualPorProveedor(year: number): Observable<EntidadMonto[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchaseStatistics}/proveedores/monto-neto-anual/sucursales/${idSucursal}?anio=${year}`;
    return this.http.get<EntidadMonto[]>(url);
  }

  getMontoNetoCompradoMensual(year: number): Observable<PeriodoMonto[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchaseStatistics}/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}`;
    return this.http.get<PeriodoMonto[]>(url);
  }

  getMontoNetoCompradoPorProveedorMensual(year: number, month: number): Observable<EntidadMonto[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchaseStatistics}/proveedores/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}&mes=${month}`;
    return this.http.get<EntidadMonto[]>(url);
  }

  getMontoNetoVendidoAnual(): Observable<PeriodoMonto[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlSalesStatistics}/monto-neto-anual/sucursales/${idSucursal}`;
    return this.http.get<PeriodoMonto[]>(url);
  }

  getMontoNetoVendidoPorClienteAnual(year: number): Observable<EntidadMonto[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlSalesStatistics}/clientes/monto-neto-anual/sucursales/${idSucursal}?anio=${year}`;
    return this.http.get<EntidadMonto[]>(url);
  }

  getMontoNetoVendidoMensual(year: number): Observable<PeriodoMonto[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlSalesStatistics}/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}`;
    return this.http.get<PeriodoMonto[]>(url);
  }

  getMontoNetoVendidoPorClienteMensual(year: number, month: number): Observable<EntidadMonto[]> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlSalesStatistics}/clientes/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}&mes=${month}`;
    return this.http.get<EntidadMonto[]>(url);
  }
}
