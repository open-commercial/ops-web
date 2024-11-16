import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ChartDirectiveDirective } from 'src/app/directives/chart-directive.directive';
import { Sucursal } from 'src/app/models/sucursal';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-statistics-year-supplier',
  templateUrl: './chart-statistics-year-supplier.component.html'
})
export class ChartStatisticsYearSupplierComponent extends ChartDirectiveDirective {
  @Input() title: string;
  @Input() dataType: 'compras' | 'ventas';
  @Input() sucursal: Sucursal;
  @Output() loadingDataChange = new EventEmitter<boolean>();

  constructor(protected chartData: ChartService) {
    super(chartData);
  }
  loadChartData(year: number): void {
    this.loadingData = true;
    const chartDataPurchaseSaleSupplier = this.dataType === 'compras' ?
      this.chartData.getChartDataPurchaseAnnualSupplier(year) :
      this.chartData.getChartDataSalesAnnualSupplier(year);
      this.loadingDataChange.emit(true)

    chartDataPurchaseSaleSupplier.subscribe({
      next: (data) => { this.handleChartData(data);
                        this.loadingData = false;
                        this.loadingDataChange.emit(false);
      },
      error: (err) => {console.log('Error al cargar datos', err);
                        this.loadingData = false;
                        this.loadingDataChange.emit(false);
      }
    })
  }

  setLoadingData(isloading: boolean) {
    this.loadingData = isloading;
  }

  isMonthOptional(): boolean {
    return true;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursal'] && changes['sucursal'].currentValue !== changes['sucursal'].previousValue) {
      const currentYear = new Date().getFullYear();
      this.loadChartData(currentYear);
    }
  }

}
