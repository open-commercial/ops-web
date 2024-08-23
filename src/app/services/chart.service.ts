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
  urlPurchasingStatistics = environment.apiUrl + '/api/v1/estadisticas/compras'

  constructor(private http: HttpClient,
              private sucursalesService: SucursalesService) {

  }

  //Compras por año
  getChartDataAnnual (): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
        const idSucursal = this.sucursalesService.getIdSucursal();
        const url = `${this.urlPurchasingStatistics}/monto-neto-anual/sucursales/${idSucursal}`;

    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.periodo);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: '$ Monto'}
          ]
        }
      })
    );
  }

  //Compras por año por proveedor
  getChartDataAnnualSupplier (year: number): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchasingStatistics}/proveedores/monto-neto-anual/sucursales/${idSucursal}?anio=${year}`;
    
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: 'Monto'}
          ]
        }
      })
    );
  }

  //compras por mes
  getChartDataMonth (year: number): Observable<{labels: string[], datasets:{data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchasingStatistics}/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}`;
    
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.periodo);
        const dataset = data.map(item => item.monto);
        return{
          labels,
          datasets: [
            {data: dataset, label: '$ Monto'}
          ]
        }
      })
    );
  }

  //Compras por mes por proveedor
  getChartDataMonthSupplier(year: number, month: number): Observable<{ labels: string[], datasets: { data: number[], label: string }[] }> {
    const idSucursal = this.sucursalesService.getIdSucursal();
    const url = `${this.urlPurchasingStatistics}/proveedores/monto-neto-mensual/sucursales/${idSucursal}?anio=${year}&mes=${month}`;
 
    return this.http.get<ChartInterface[]>(url).pipe(
      map(data => {
        const labels = data.map(item => item.entidad);
        const dataset = data.map(item => item.monto);
  
        return {
          labels,
          datasets: [
            { data: dataset, label: 'Monto' }
          ]
        };
      })
    );
  }

}
