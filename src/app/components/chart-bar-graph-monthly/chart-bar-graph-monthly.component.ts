import { Component, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { ChartDirective } from 'src/app/directives/chart.directive';
import { Sucursal } from 'src/app/models/sucursal';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-bar-graph-monthly',
  templateUrl: './chart-bar-graph-monthly.component.html',
  styleUrls: ['./chart-bar-graph-monthly.component.scss']
})
export class ChartBarGraphMonthlyComponent extends ChartDirective {
  @Input() title: string = '';
  @Input() chartType: 'ventas' | 'compras' = 'compras';
  @Input() sucursal: Sucursal;
  @Input() selectedYear: number;
  chartDataArray: any[] = [];
  noDataAvailable: boolean = false;

  constructor(private readonly chartService: ChartService) {
    super()
  }

  override loadChartData(year: number): void {
    const allList = this.generateMonthsData().map(m => m.name);

    this.setLoadingState(true); 

    if (this.chartType === 'compras') {
      this.chartService.getChartDataPurchaseMonth(year).subscribe(data => {
        this.handleData(data, allList);
        this.setLoadingState(false); 
      });
    } else if (this.chartType === 'ventas') {
      this.chartService.getChartDataSalesMonth(year).subscribe(data => {
        this.handleData(data, allList);
        this.setLoadingState(false); 
      });
    }
  }

  handleData(data: any, allList: string[]): void {
    if (data?.labels?.length > 0) {
      const monthList = data.labels.map(labels => allList[parseInt(labels) - 1]);
      this.updateChart(data, monthList);
      this.chartDataArray = data.labels;
      this.noDataAvailable = false;
    } else {
      this.chartDataArray = [];
      this.noDataAvailable = true;
    }
    this.setLoadingState(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursal'] && this.shouldReloadChartData(changes['sucursal'])) {
      const currentYear = new Date().getFullYear();
      if (this.selectedYear !== currentYear) {
        this.selectedYear = currentYear;
      }
      this.loadChartData(this.selectedYear);
    }
    if (changes['chartType'] && !changes['chartType'].firstChange) {
      this.loadChartData(this.selectedYear);
    }
  }

  private shouldReloadChartData(change: SimpleChange): boolean {
    const { previousValue, currentValue } = change;
    if (!currentValue) return false;
    if (!previousValue) return true;
    return previousValue.id !== currentValue.id || previousValue.nombre !== currentValue.nombre;
  }

}
