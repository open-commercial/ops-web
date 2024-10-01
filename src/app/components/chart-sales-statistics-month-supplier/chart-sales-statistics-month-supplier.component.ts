import { Component } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-sales-statistics-month-supplier',
  templateUrl: './chart-sales-statistics-month-supplier.component.html',
  styleUrls: ['./chart-sales-statistics-month-supplier.component.scss']
})
export class ChartSalesStatisticsMonthSupplierComponent extends ChartDirectiveDirective {
  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  loadChartData(year: number, month: number): void {
    this.chartData.getChartDataSalesMonthSupplier(year, month).subscribe({
      next: (data) => {
        if (data && data.labels && data.datasets && data.datasets.length > 0) {
          const labels = data.labels;
          const datasetData = data.datasets[0].data;

          if (labels.length === datasetData.length) {
            this.suppliers = labels.map((label, index) => ({
              entidad: label,
              monto: datasetData[index],
            }));
          } else {
            console.log('Desajuste en la longitud de los datos');
            this.suppliers = [];
          }
        } (error) => {
          console.log('Error al cargar los datos de ventas por proveedor', error);
          this.suppliers = [];
        }
      }
    });
  }

}
