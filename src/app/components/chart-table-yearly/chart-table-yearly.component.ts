import { Component, SimpleChanges, Input, SimpleChange } from '@angular/core';
import { ChartDirective } from 'src/app/directives/chart.directive';
import { ChartInterface } from 'src/app/models/chart-interface';
import { Sucursal } from 'src/app/models/sucursal';
import { ChartService } from 'src/app/services/chart.service';


@Component({
  selector: 'app-chart-table-yearly',
  templateUrl: './chart-table-yearly.component.html',
  styleUrls: ['./chart-table-yearly.component.scss']
})
export class ChartTableYearlyComponent extends ChartDirective {
  @Input() title: string = '';
  @Input() dataType: 'compras' | 'ventas';
  @Input() years: number[] = [];
  @Input() selectedYear: number;
  @Input() suppliers: ChartInterface[] = [];
  @Input() sucursal: Sucursal;

  constructor(private readonly chartService: ChartService) { 
    super();
  }

  loadChartData(year: number): void {
    this.loadingData = true;
    const chartDataPurchaseSaleSupplier = this.dataType === 'compras' ?
      this.chartService.getChartDataPurchaseAnnualSupplier(year) :
      this.chartService.getChartDataSalesAnnualSupplier(year);

    chartDataPurchaseSaleSupplier.subscribe({
      next: (data) => { this.handleChartData(data);
                        this.loadingData = false;
      },
      error: (err) => {console.log('Error al cargar datos', err);
                        this.loadingData = false;
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursal'] && this.shouldReloadChartData(changes['sucursal'])) {
      const currentYear = new Date().getFullYear();
      if (this.selectedYear !== currentYear) {
        this.selectedYear = currentYear;
      }
      this.loadChartData(this.selectedYear);
    }

    if (changes['dataType'] && !changes['dataType'].firstChange) {
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
