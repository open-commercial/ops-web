import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ChartDirective } from 'src/app/directives/chart.directive';
import { Sucursal } from 'src/app/models/sucursal';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart-table-monthly',
  templateUrl: './chart-table-monthly.component.html',
  styleUrls: ['./chart-table-monthly.component.scss']
})
export class ChartTableMonthlyComponent extends ChartDirective {
  @Input() title: string;
  @Input() dataType: 'compras' | 'ventas';
  @Input() loadingData: boolean = false;
  @Input() selectedMonth: number;
  @Input() selectedYear: number;
  @Input() sucursal: Sucursal;

  constructor(private readonly chartService: ChartService) {
    super();
  }

  ngOnInit(): void {
    this.years = this.generateYearData();
    this.selectedYear = new Date().getFullYear();
    this.months = this.generateMonthsData();
    this.selectedMonth = new Date().getMonth() + 1;
    this.loadChartData(this.selectedYear, this.selectedMonth);
  }

  loadChartData(year: number, month: number): void {
    this.loadingData = true;
    const chartDataPurchaseSale = this.dataType === 'compras' ?
    this.chartService.getChartDataPurchaseMonthSupplier(year, month) :
    this.chartService.getChartDataSalesMonthSupplier(year, month);

    chartDataPurchaseSale.subscribe({
      next: (data) => {
        this.handleChartData(data);
        this.loadingData = false;
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursal'] && changes['sucursal'].currentValue !== changes['sucursal'].previousValue) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      this.selectedYear = currentYear;
      this.selectedMonth = currentMonth;
      this.loadChartData(this.selectedYear, this.selectedMonth);
    }
  }

}
