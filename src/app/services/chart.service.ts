import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ChartInterface } from '../models/chart-interface';
import { environment } from 'src/environments/environment';
import { SucursalesService } from './sucursales.service';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  urlPurchasingStatistics = environment.apiUrl + '/api/v1/estadisticas/compras';
  urlSalesStatistics = environment.apiUrl + '/api/v1/estadisticas/ventas'

  constructor(private http: HttpClient,
              private sucursalesService: SucursalesService) {
  }

  //************************* COMPRAS ********************************* */
  //Compras por año
  getChartDataPurchaseAnnual (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
        const idSucursal = this.sucursalesService.getIdSucursal();
        const url = `${this.urlPurchasingStatistics}/monto-neto-anual/sucursales/${idSucursal}`;

    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.periodo);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: '$ Monto en peso'}
          ]
        }
      })
    );
  }

  //Compras por año por proveedor
  getChartDataPurchaseAnnualSupplier (year: number): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchasingStatistics}/proveedores/monto-neto-anual/sucursales/${idSucursal}?anio=${year}`;
    
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: '$ Monto en peso'}
          ]
        }
      })
    );
  }

  //compras por mes
  getChartDataPurchaseMonth (year: number): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchasingStatistics}/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}`;
    
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.periodo);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: '$ Monto en peso'}
          ]
        }
      })
    );
  }

  //Compras por mes por proveedor
  getChartDataPurchaseMonthSupplier(year: number, month: number): Observable<{ labels: string[], datasets: { data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchasingStatistics}/proveedores/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}&mes=${month}`;
 
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
  
        return {
          labels,
          datasets: [
            { data: dataset, label: '$ Monto en peso' }
          ]
        };
      })
    );
  }

    //************************* VENTAS ********************************* */
  //Ventas por año
  getChartDataSalesAnnual (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlSalesStatistics}/monto-neto-anual/sucursales/${idSucursal}`;
    return this.http.get<ChartInterface[]>(url).pipe( map(data => {
      const labels = data.map(item => item.periodo);
      const dataset = data.map(item => item.monto);
      return{
        labels,
        datasets: [
          {data: dataset, label: '$ Monto en peso'}
        ]
      }
    }))
  }

  //Ventas por año por proveedor
  getChartDataSalesAnnualSupplier(year: number): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlSalesStatistics}/rubros/monto-neto-anual/sucursales/${idSucursal}?anio=${year}`;
    return this.http.get<ChartInterface[]>(url).pipe( map(data => {
      const labels = data.map(item => item.entidad);
      const dataset = data.map(item => item.monto);
      return{
        labels,
        datasets: [
          {data: dataset, label: '$ Monto en peso'}
        ]
      }
    }))
  }

  //Ventas por mes
  getChartDataSalesMonth (year: number): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlSalesStatistics}/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}`;
    return this.http.get<ChartInterface[]>(url).pipe( map(data => {
      const labels = data.map(item => item.periodo);
      const dataset = data.map(item => item.monto);
      return{
        labels,
        datasets: [
          {data: dataset, label: '$ Monto en peso'}
        ]
      }
    }))
  }

  //Ventas por mes por proveedor
  getChartDataSalesMonthSupplier(year: number, month: number): Observable<{ labels: string[], datasets: { data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlSalesStatistics}/rubros/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}&mes=${month}`;
    return this.http.get<ChartInterface[]>(url).pipe( map(data => {
      const labels = data.map(item => item.entidad);
      const dataset = data.map(item => item.monto);
      return{
        labels,
        datasets: [
          {data: dataset, label: '$ Monto en peso'}
        ]
      }
    }))
  }

}
