import { Component, OnInit } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartInterface } from 'src/app/models/chart-interface';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-sales-statistics-year-supplier',
  templateUrl: './chart-sales-statistics-year-supplier.component.html',
  styleUrls: ['./chart-sales-statistics-year-supplier.component.scss']
})
export class ChartSalesStatisticsYearSupplierComponent extends ChartDirectiveDirective {

  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  loadChartData(year: number): void {
    this.chartData.getChartDataSalesAnnualSupplier(year).subscribe({
      next: (data) => {
        this.suppliers = data.datasets[0].data.map((monto, index) => ({
          entidad: data.labels[index],
          monto: monto
        })) || [];
      }, error: (error) => {
        console.error('Error al cargar los datos de ventas por proveedor', error);
      }
    });
  }
}
