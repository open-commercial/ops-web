import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-statistics-month-supplier',
  templateUrl: './chart-statistics-month-supplier.component.html'
})
export class ChartStatisticsMonthSupplierComponent extends ChartDirectiveDirective {
  @Input() title: string;
  @Input() dataType: 'compras' | 'ventas';
  @Input() loadingData: boolean = false;
  @Output() loadingDataChange = new EventEmitter<boolean>();

  constructor(protected chartData: ChartService) {
    super(chartData);
  }

  loadChartData(year: number, month: number): void {
    this.loadingData = true;
    this.loadingDataChange.emit(true);
    const chartDataPurchaseSale = this.dataType === 'compras' ?
      this.chartData.getChartDataPurchaseMonthSupplier(year, month) :
      this.chartData.getChartDataSalesMonthSupplier(year, month);


    chartDataPurchaseSale.subscribe({
      next: (data) => { this.handleChartData(data);
                        this.loadingData = false;
                        this.loadingDataChange.emit(false);
      },
      error: (err) => { console.log('Error al cargar datos',err);
                        this.loadingData = false;
                        this.loadingDataChange.emit(false);
      },
      });
  }

  setLoadingData(isloading: boolean) {
    this.loadingData = isloading;
  }

  isMonthOptional(): boolean {
    return false;
  }
     
}
