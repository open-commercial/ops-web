import { Component, Input, OnInit } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-statistics-year-supplier',
  templateUrl: './chart-statistics-year-supplier.component.html',
  styleUrls: ['./chart-statistics-year-supplier.component.scss']
})
export class ChartStatisticsYearSupplierComponent extends ChartDirectiveDirective {
  @Input() dataType: 'compras' | 'ventas';
  @Input() title: string = '';

  constructor(protected chartData: ChartService) {
    super(chartData);
   }

  loadChartData(year: number): void {
    let chartDataPurchaseSaleSupplier;

    if (this.dataType === 'compras') {
      chartDataPurchaseSaleSupplier = this.chartData.getChartDataPurchaseAnnualSupplier(year)
    } else if (this.dataType === 'ventas') {
      chartDataPurchaseSaleSupplier = this.chartData.getChartDataSalesAnnualSupplier(year)
    }
    chartDataPurchaseSaleSupplier.subscribe({
      next: (data) => {
        if (data && data.labels && data.datasets && data.datasets.length > 0) {
          const labels = data.labels;
          const datasetData = data.datasets[0].data;
          if (labels.length === datasetData.length) {
            this.suppliers = labels.map((label, index) => ({
              entidad: label,
              monto: datasetData[index],
            }));
            this.updateChart(data, labels);
          } else {
            console.log('Desajuste en la longitud de los datos');
            this.suppliers = [];
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos', error);
      }
    })
  }

}
