import { Component, Input } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';


@Component({
  selector: 'app-chart-statistics-month-supplier',
  templateUrl: './chart-statistics-month-supplier.component.html'
})

export class ChartStatisticsMonthSupplierComponent extends ChartDirectiveDirective {
  @Input() title: string;
  @Input() dataType: 'compras' | 'ventas';

  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  loadChartData(year: number, month: number): void {
    const chartDataPurchaseSale = this.dataType === 'compras' ?
      this.chartData.getChartDataPurchaseMonthSupplier(year, month) :
      this.chartData.getChartDataSalesMonthSupplier(year, month);

    chartDataPurchaseSale.subscribe({
      next: (data) => this.handleChartData(data),
      error: (err) => console.log('Error al cargar datos',err),
      });
  }

  isMonthOptional(): boolean {
    return false;
  }
     
}
