import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { Sucursal } from 'src/app/models/sucursal';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-statistics-year',
  templateUrl: './chart-statistics-year.component.html',
  styleUrls: ['./chart-statistics-year.component.scss']
})
export class ChartStatisticsYearComponent extends ChartDirectiveDirective {
  @Input() title: string = '';
  @Input() chartType: 'compras' | 'ventas' = 'compras';
  @Input() sucursal: Sucursal;
  chartDataArray: any[] = [];
  noDataAvailable: boolean = false;

  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  override loadChartData(): void {
    this.setLoadingState(true);
    if (this.chartType === 'compras') {
      this.chartData.getChartDataPurchaseAnnual().subscribe(data => {
        this.handleData(data);
        this.setLoadingState(false);
      });
    } else if (this.chartType === 'ventas') {
      this.chartData.getChartDataSalesAnnual().subscribe(data => {
        this.handleData(data);
        this.setLoadingState(false);
      });
    }
  }

  handleData(data: any): void {
    if (data && data.labels.length > 0) {
      const labels = this.generateYearData().slice(0, 4).reverse();
      this.updateChart(data, labels.map(String));
      this.chartDataArray = data.labels;
      this.noDataAvailable = false;
    } else {
      this.chartDataArray = [];
      this.noDataAvailable = true;
    }
    this.setLoadingState(false);
  }

  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursal'] && changes['sucursal'].currentValue !== changes['sucursal'].previousValue) {
      const currentYear = new Date().getFullYear();
      this.selectedYear = currentYear;
      this.loadChartData();
    }
  }

}
