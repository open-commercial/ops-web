import { Component, Input } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-statistics-month',
  templateUrl: './chart-statistics-month.component.html',
  styleUrls: ['./chart-statistics-month.component.scss']
})
export class ChartStatisticsMonthComponent extends ChartDirectiveDirective {
  @Input() title: string = '';
  @Input() chartType: 'ventas' | 'compras' = 'compras';

  chartDataArray: any[] = [];
  noDataAvailable: boolean = false;
  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  override loadChartData(year: number): void {
    const allList = this.generateMonthsData().map(m => m.name);

    if (this.chartType === 'compras') {
      this.chartData.getChartDataPurchaseMonth(year).subscribe(data => {
        this.handleData(data, allList);
      });
    } else if (this.chartType === 'ventas') {
      this.chartData.getChartDataSalesMonth(year).subscribe(data => {
        this.handleData(data, allList);
      });
    }
  }

  handleData(data: any, allList: string[]): void {
    if (data && data.labels && data.labels.length > 0) {
      const monthList = data.labels.map(labels => allList[parseInt(labels) - 1]);
      this.updateChart(data, monthList);
      this.chartDataArray = data.labels;
      this.noDataAvailable = false;
    } else {
      this.chartDataArray = [];
      this.noDataAvailable = true;
    }
  }

  // onYearChange(year: string): void {
  //   this.selectedYear = parseInt(year, 10);
  //   this.loadInitialChartData();
  // }

}
