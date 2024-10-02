import { Component } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-sales-statistics-year',
  templateUrl: './chart-sales-statistics-year.component.html',
  styleUrls: ['./chart-sales-statistics-year.component.scss']
})
export class ChartSalesStatisticsYearComponent extends ChartDirectiveDirective {

  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  override loadChartData(): void {
    this.chartData.getChartDataSalesAnnual().subscribe(data => {
      const labels = this.generateYearData().slice(-4);
      this.updateChart(data, labels.map(String));
    })
  }
}
