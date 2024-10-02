import { Component } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-sales-statistics-month',
  templateUrl: './chart-sales-statistics-month.component.html',
  styleUrls: ['./chart-sales-statistics-month.component.scss']
})
export class ChartSalesStatisticsMonthComponent extends ChartDirectiveDirective {

  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  override loadChartData(year: number): void {
    const allList = this.generateMonthsData().map(m => m.name);

    this.chartData.getChartDataSalesMonth(year).subscribe(data => {
      const monthList = data.labels.map(labels => allList[parseInt(labels) - 1]);
      this.updateChart(data, monthList);
    });
  }
}
